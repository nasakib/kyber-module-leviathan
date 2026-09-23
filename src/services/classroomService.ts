import { getSupabase } from '../lib/supabase';
import { Classroom, Assignment, AssignmentSubmission } from '../types/cloud';
import { UserProgressStore } from '../types/game';

// Sample fallback classroom data for offline / preview mode
const FALLBACK_CLASSROOMS: Classroom[] = [
  {
    id: 'sample_cls_1',
    code: 'MATH-42',
    name: 'Honors Coordinate Geometry & Calculus',
    teacherId: 'teacher_sample_1',
    createdAt: '2026-09-10T12:00:00Z',
    memberCount: 24,
  },
];

const FALLBACK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'sample_asg_1',
    classroomId: 'sample_cls_1',
    title: 'Unit 1: Linear Slopes & Kinetic Trajectories',
    requiredLevelIds: ['linear_1', 'linear_2', 'linear_3', 'kinetics_1', 'kinetics_2'],
    dueDate: '2026-10-01T23:59:59Z',
    createdAt: '2026-09-15T09:00:00Z',
    submissionCount: 18,
  },
  {
    id: 'sample_asg_2',
    classroomId: 'sample_cls_1',
    title: 'Unit 2: Matrix Coordinate Transformations',
    requiredLevelIds: ['warp_1', 'warp_2', 'warp_3'],
    dueDate: '2026-10-15T23:59:59Z',
    createdAt: '2026-09-20T09:00:00Z',
    submissionCount: 7,
  },
];

// Helper to generate a 6-character alphanumeric code
function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VF-';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createClassroom(
  name: string,
  teacherId: string
): Promise<{ success: boolean; classroom?: Classroom; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    const mockClass: Classroom = {
      id: `local_cls_${Date.now()}`,
      code: generateClassCode(),
      name,
      teacherId,
      createdAt: new Date().toISOString(),
      memberCount: 1,
    };
    return { success: true, classroom: mockClass };
  }

  try {
    const code = generateClassCode();
    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        name,
        code,
        teacher_id: teacherId,
      })
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      classroom: {
        id: data.id,
        code: data.code,
        name: data.name,
        teacherId: data.teacher_id,
        createdAt: data.created_at,
        memberCount: 0,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Classroom creation failed' };
  }
}

export async function joinClassroomByCode(
  code: string,
  studentId: string
): Promise<{ success: boolean; classroom?: Classroom; error?: string }> {
  const supabase = getSupabase();
  const cleanCode = code.trim().toUpperCase();

  if (!supabase) {
    const matched = FALLBACK_CLASSROOMS.find((c) => c.code === cleanCode);
    if (matched) {
      return { success: true, classroom: matched };
    }
    return { success: false, error: 'Invalid classroom code in offline mode. Try "MATH-42".' };
  }

  try {
    // 1. Find classroom
    const { data: cls, error: findErr } = await supabase
      .from('classrooms')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (findErr || !cls) {
      return { success: false, error: 'Classroom not found. Check your 6-character code.' };
    }

    // 2. Insert member
    const { error: joinErr } = await supabase.from('classroom_members').upsert({
      classroom_id: cls.id,
      student_id: studentId,
      joined_at: new Date().toISOString(),
    });

    if (joinErr) {
      return { success: false, error: joinErr.message };
    }

    return {
      success: true,
      classroom: {
        id: cls.id,
        code: cls.code,
        name: cls.name,
        teacherId: cls.teacher_id,
        createdAt: cls.created_at,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to join classroom' };
  }
}

export async function fetchUserClassrooms(
  userId: string,
  isTeacher: boolean
): Promise<Classroom[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return FALLBACK_CLASSROOMS;
  }

  try {
    if (isTeacher) {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return FALLBACK_CLASSROOMS;
      return data.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        teacherId: r.teacher_id,
        createdAt: r.created_at,
      }));
    } else {
      const { data, error } = await supabase
        .from('classroom_members')
        .select('classroom_id, classrooms(*)')
        .eq('student_id', userId);

      if (error || !data) return FALLBACK_CLASSROOMS;
      return data
        .filter((r) => r.classrooms)
        .map((r) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const c: any = r.classrooms;
          return {
            id: c.id,
            code: c.code,
            name: c.name,
            teacherId: c.teacher_id,
            createdAt: c.created_at,
          };
        });
    }
  } catch {
    return FALLBACK_CLASSROOMS;
  }
}

export async function fetchAssignments(classroomId: string): Promise<Assignment[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return FALLBACK_ASSIGNMENTS.filter((a) => a.classroomId === classroomId || a.classroomId === 'sample_cls_1');
  }

  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error || !data) return FALLBACK_ASSIGNMENTS;

    return data.map((r) => ({
      id: r.id,
      classroomId: r.classroom_id,
      title: r.title,
      requiredLevelIds: r.required_level_ids,
      dueDate: r.due_date,
      createdAt: r.created_at,
    }));
  } catch {
    return FALLBACK_ASSIGNMENTS;
  }
}

export async function createAssignment(
  classroomId: string,
  title: string,
  requiredLevelIds: string[],
  dueDate?: string
): Promise<{ success: boolean; assignment?: Assignment; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    const mock: Assignment = {
      id: `local_asg_${Date.now()}`,
      classroomId,
      title,
      requiredLevelIds,
      dueDate,
      createdAt: new Date().toISOString(),
      submissionCount: 0,
    };
    return { success: true, assignment: mock };
  }

  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        classroom_id: classroomId,
        title,
        required_level_ids: requiredLevelIds,
        due_date: dueDate || null,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      assignment: {
        id: data.id,
        classroomId: data.classroom_id,
        title: data.title,
        requiredLevelIds: data.required_level_ids,
        dueDate: data.due_date,
        createdAt: data.created_at,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create assignment' };
  }
}

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  studentName: string,
  requiredLevelIds: string[],
  progress: UserProgressStore
): Promise<{ success: boolean; error?: string; submission?: AssignmentSubmission }> {
  const supabase = getSupabase();

  // Calculate completed levels from current user progress
  const completedLevels = requiredLevelIds.filter((id) => progress[id]?.completed);
  const totalStars = requiredLevelIds.reduce((sum, id) => sum + (progress[id]?.stars || 0), 0);
  const goldCount = requiredLevelIds.filter((id) => progress[id]?.masteryStatus?.hypothesisCorrect).length;

  const submission: AssignmentSubmission = {
    id: `sub_${Date.now()}`,
    assignmentId,
    studentId,
    studentName,
    completedLevels,
    totalStars,
    goldMasteriesCount: goldCount,
    submittedAt: new Date().toISOString(),
  };

  if (!supabase) {
    return { success: true, submission };
  }

  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          student_name: studentName,
          completed_levels: completedLevels,
          total_stars: totalStars,
          gold_masteries_count: goldCount,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      submission: {
        id: data.id,
        assignmentId: data.assignment_id,
        studentId: data.student_id,
        studentName: data.student_name,
        completedLevels: data.completed_levels,
        totalStars: data.total_stars,
        goldMasteriesCount: data.gold_masteries_count,
        submittedAt: data.submitted_at,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Submission failed' };
  }
}

export async function fetchAssignmentSubmissions(
  assignmentId: string
): Promise<AssignmentSubmission[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [
      {
        id: 'sub_sample_1',
        assignmentId,
        studentId: 'student_1',
        studentName: 'Alex Mercer',
        completedLevels: ['linear_1', 'linear_2', 'kinetics_1'],
        totalStars: 8,
        goldMasteriesCount: 2,
        submittedAt: '2026-09-22T15:20:00Z',
      },
      {
        id: 'sub_sample_2',
        assignmentId,
        studentId: 'student_2',
        studentName: 'Maya Lin',
        completedLevels: ['linear_1', 'linear_2', 'linear_3', 'kinetics_1', 'kinetics_2'],
        totalStars: 15,
        goldMasteriesCount: 4,
        submittedAt: '2026-09-22T17:45:00Z',
      },
    ];
  }

  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('total_stars', { ascending: false });

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      assignmentId: r.assignment_id,
      studentId: r.student_id,
      studentName: r.student_name,
      completedLevels: r.completed_levels,
      totalStars: r.total_stars,
      goldMasteriesCount: r.gold_masteries_count,
      submittedAt: r.submitted_at,
    }));
  } catch {
    return [];
  }
}
