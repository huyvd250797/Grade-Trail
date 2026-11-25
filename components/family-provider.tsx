"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { studioClient as client } from "../lib/content-studio";
import { progressRpcArguments, type FamilyProgress, type FamilyStudent, type LegacyProgress } from "../lib/family-progress";
import type { LessonPosition } from "../lib/lesson-engine";

type FamilyState = {
  account: string | null;
  loading: boolean;
  error: boolean;
  students: FamilyStudent[];
  student?: FamilyStudent;
  rows: FamilyProgress[];
  saving: boolean;
  saveFailed: boolean;
  selectStudent: (id: string) => void;
  saveStudent: (name: string, grade: number, id?: string, requestId?: string) => Promise<boolean>;
  record: (lessonKey: string, position: LessonPosition, completed: boolean, result?: boolean) => void;
  importProgress: (id: string, rows: LegacyProgress[]) => Promise<boolean>;
  retry: () => void;
  reload: () => void;
};

const guest: FamilyState = {
  account: null, loading: false, error: false, students: [], rows: [], saving: false, saveFailed: false,
  selectStudent: () => {}, saveStudent: async () => false, record: () => {}, importProgress: async () => false,
  retry: () => {}, reload: () => {},
};

const FamilyContext = createContext(guest);
export const useFamily = () => useContext(FamilyContext);

async function store(row: FamilyProgress) {
  if (!client) return null;
  try {
    const { data, error } = await client.rpc("family_save_lesson_progress", progressRpcArguments(row));
    return error || !data ? null : data as FamilyProgress;
  } catch { return null; }
}

function rowKey(row: Pick<FamilyProgress, "student_id" | "lesson_key">) {
  return row.student_id + ":" + row.lesson_key;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{ id: string; email?: string } | null>();
  useEffect(() => {
    if (!client) return;
    const { data } = client.auth.onAuthStateChange((_event, session) => setAuth(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!auth) return <FamilyContext.Provider value={client && auth === undefined ? { ...guest, loading: true } : guest}>
    {children}
  </FamilyContext.Provider>;

  return <FamilySession key={auth.id} account={auth.email ?? "Phụ huynh"} parent={auth.id}>{children}</FamilySession>;
}

function FamilySession({ children, account, parent }: { children: ReactNode; account: string; parent: string }) {
  const storageKey = "gradetrail:family-student:" + parent;
  const [chosen, setChosen] = useState(() => {
    try { return window.localStorage.getItem(storageKey) ?? ""; } catch { return ""; }
  });
  const [students, setStudents] = useState<FamilyStudent[]>([]);
  const [allRows, setAllRows] = useState<FamilyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const ledger = useRef(new Map<string, FamilyProgress>());
  const pending = useRef(new Map<string, FamilyProgress>());
  const running = useRef(false);
  const alive = useRef(false);
  const student = students.find((row) => row.id === chosen);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    const api = client;
    if (!api) return;
    let ignore = false;
    async function load() {
      if (!api) return;
      try {
        const profiles = await api.from("family_students").select("id,display_name,grade").order("created_at");
        if (profiles.error) throw profiles.error;
        const records: FamilyProgress[] = [];
        for (let offset = 0; ; offset += 200) {
          const response = await api.from("family_lesson_progress").select("*").order("student_id").order("lesson_key").range(offset, offset + 199);
          if (response.error) throw response.error;
          records.push(...response.data as FamilyProgress[]);
          if (response.data.length < 200 || ignore) break;
        }
        if (ignore) return;
        ledger.current = new Map(records.map((row) => [rowKey(row), row]));
        setAllRows(records);
        setStudents(profiles.data);
        setLoading(false);
      } catch {
        if (!ignore) { setError(true); setLoading(false); }
      }
    }
    void load();
    return () => { ignore = true; };
  }, [reloadCount]);

  function selectStudent(id: string) {
    setChosen(id);
    try { window.localStorage.setItem(storageKey, id); } catch { /* Selection works in this session. */ }
  }

  async function saveStudent(name: string, grade: number, id?: string, requestId?: string) {
    if (!client) return false;
    try {
      const values = { display_name: name.trim(), grade };
      if (!id && !requestId) return false;
      if (!id) {
        const inserted = await client.from("family_students").upsert({ ...values, id: requestId }, { onConflict: "id", ignoreDuplicates: true, defaultToNull: false });
        if (inserted.error) return false;
      }
      const profiles = client.from("family_students");
      const response = id
        ? await profiles.update(values).eq("id", id).select("id,display_name,grade").single()
        : await profiles.select("id,display_name,grade").eq("id", requestId!).single();
      const { data, error } = response;
      if (error || !data) return false;
      setStudents((current) => id ? current.map((item) => item.id === id ? data : item) : current.some((item) => item.id === data.id) ? current : [...current, data]);
      if (!id) selectStudent(data.id);
      return true;
    } catch { return false; }
  }

  function reflect(row: FamilyProgress) {
    ledger.current.set(rowKey(row), row);
    setAllRows([...ledger.current.values()]);
  }

  async function flush() {
    if (running.current || !pending.current.size || !alive.current) return;
    running.current = true;
    setSaving(true);
    setSaveFailed(false);
    while (pending.current.size && alive.current) {
      const [key, row] = pending.current.entries().next().value!;
      const saved = await store(row);
      if (!alive.current) break;
      if (!saved) { setSaveFailed(true); break; }
      if (pending.current.get(key) === row) {
        pending.current.delete(key);
        reflect(saved);
      }
    }
    running.current = false;
    if (alive.current) setSaving(false);
  }

  function record(lessonKey: string, position: LessonPosition, completed: boolean, result?: boolean) {
    if (!student) return;
    const row = { student_id: student.id, lesson_key: lessonKey };
    const previous = ledger.current.get(rowKey(row));
    const instant = new Date().toISOString();
    const next = {
      ...row, completed: completed || (previous?.completed ?? false),
      current_step: position.current, furthest_step: position.furthest, last_activity_at: instant,
      last_result: result ?? previous?.last_result ?? null,
      last_result_at: result === undefined ? previous?.last_result_at ?? null : instant,
    };
    pending.current.set(rowKey(row), next);
    reflect(next);
    void flush();
  }

  async function importProgress(id: string, rows: LegacyProgress[]) {
    for (const row of rows) {
      if (!alive.current) return false;
      const saved = await store({ ...row, student_id: id });
      if (!saved || !alive.current) return false;
      if (!pending.current.has(rowKey(saved))) reflect(saved);
    }
    return true;
  }

  return <FamilyContext.Provider value={{
    account, loading, error, students, student, rows: allRows.filter((row) => row.student_id === student?.id),
    saving, saveFailed, selectStudent, saveStudent, record, importProgress, retry: () => { void flush(); },
    reload: () => { setError(false); setLoading(true); setReloadCount((count) => count + 1); },
  }}>{children}</FamilyContext.Provider>;
}
