import { randomUUID } from "crypto";
import { getDb } from "./db";
import type { ProfileForMatch } from "./matching";

export interface ProfileRow {
  id: string;
  fullName: string;
  college: string;
  branch: string;
  year: number;
  experience: string;
  availability: string;
  bio: string;
  isLookingForTeam: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getSkillsForProfile(profileId: string): string[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT s.name FROM user_skills us JOIN skills s ON s.id = us.skill_id WHERE us.profile_id = ?`
    )
    .all(profileId)
    .map((r: any) => r.name);
}

export function getRolesForProfile(profileId: string): string[] {
  const db = getDb();
  return db
    .prepare(`SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.profile_id = ?`)
    .all(profileId)
    .map((r: any) => r.name);
}

export function getProblemStatementsForProfile(profileId: string): { id: number; title: string }[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT ps.id, ps.title FROM profile_problem_statements pps
       JOIN problem_statements ps ON ps.id = pps.problem_statement_id
       WHERE pps.profile_id = ?`
    )
    .all(profileId) as { id: number; title: string }[];
}

export function getFullProfile(profileId: string) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT p.id, p.full_name as fullName, p.college, p.branch, p.year, p.experience,
              p.availability, p.bio, p.is_looking_for_team as isLookingForTeam,
              p.is_admin as isAdmin, p.created_at as createdAt, p.updated_at as updatedAt,
              u.email as email
       FROM profiles p JOIN users u ON u.id = p.id WHERE p.id = ?`
    )
    .get(profileId) as any;
  if (!row) return null;
  return {
    ...row,
    isLookingForTeam: !!row.isLookingForTeam,
    isAdmin: !!row.isAdmin,
    skills: getSkillsForProfile(profileId),
    roles: getRolesForProfile(profileId),
    problemStatements: getProblemStatementsForProfile(profileId),
  };
}

export function toMatchProfile(profileId: string): ProfileForMatch {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, full_name as fullName, experience, availability FROM profiles WHERE id = ?`)
    .get(profileId) as any;
  return {
    id: row.id,
    fullName: row.fullName,
    experience: row.experience,
    availability: row.availability,
    skills: getSkillsForProfile(profileId),
    roles: getRolesForProfile(profileId),
    problemStatementIds: getProblemStatementsForProfile(profileId).map((p) => p.id),
  };
}

export function createNotification(receiverProfileId: string, type: string, message: string) {
  const db = getDb();
  db.prepare(
    `INSERT INTO notifications (id, receiver_profile_id, type, message) VALUES (?, ?, ?, ?)`
  ).run(randomUUID(), receiverProfileId, type, message);
}
