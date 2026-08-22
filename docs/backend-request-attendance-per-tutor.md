# What we need: attendance scoped per tutor

Hi — sharing a gap we ran into while testing attendance, and what the product
needs it to do. Not prescribing an implementation; you'll know the cleanest way
to do it on your side. This is just the behaviour we're after and the context.

## Context

Attendance is self-check-in: a tutor opens attendance for the day, and each of
their students marks themselves present from their dashboard. In real use there
are **many tutors**, each running their **own class with their own students**
(students see a tutor through the course they're enrolled in).

## What's happening now

Right now attendance behaves as **one shared session for the whole school per
day**. In practice that means:

- When **one** tutor opens attendance, it counts as open for **everyone** —
  every student can check in, and every other tutor's screen shows "attendance
  is open", even tutors who never opened it.
- A student's check-in isn't tied to a particular tutor; it lands in the single
  global session.
- Tutors can't tell their own class's attendance apart from another class's.

So a tutor can't actually run attendance for just their class.

## What we need it to do

We need attendance to be **scoped to the individual tutor and their students**:

1. When a tutor opens attendance, it should apply **only to their own
   students** — not to students who belong to other tutors.
2. A student should mark present against **their own tutor's** session (the
   tutor of the course they're enrolled in), and only when that tutor has
   actually opened attendance.
3. Each tutor should see and monitor **only their own students'** check-ins,
   counts and attendance rate.
4. If Tutor A has attendance open but Tutor B hasn't, **Tutor B's students
   should not see "attendance is open."**

In short: one tutor's attendance shouldn't leak into another tutor's class.

## A couple of things that might help (your call)

- The link between a student and their tutor already exists through
  **enrollments / courses** (a course has a tutor, a student is enrolled in a
  course), so there's an existing relationship to scope by.
- The "activate session" call already accepts an optional `courseId`, which
  might be a natural anchor for scoping — but however you model it (per tutor,
  per course, per class) is fine with us.

## On our side

The frontend is already wired to the current attendance endpoints (activate,
current session, check-in, check-ins, my record) and works. We're happy to
adapt to whatever shape you land on — we just need the **scoping** so each
tutor's attendance is isolated to their own students. Whatever's easiest for you
to support, tell us the shape and we'll consume it.

Thanks!
