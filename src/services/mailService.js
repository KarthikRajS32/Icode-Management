/**
 * Refactored Student Activity Notification Mail Service
 * Prepares mock notification envelopes for parents when teachers log child updates.
 */

/**
 * Simulates compiling and delivering an observation email to a parent.
 * Logs high-fidelity payload structures to the console.
 * 
 * @param {Object} activity - Observation details.
 * @param {Object} student - Enrolled child.
 * @param {Object} parent - Linked parent recipient.
 * @param {Object} teacher - Class leader instructor.
 * @param {Object} classroom - Assigned classroom.
 * @returns {Promise<Object>} - Delivers a delivered mock outbox receipt.
 */
export const sendStudentActivityMail = (activity, student, parent, teacher, classroom) => {
  return new Promise((resolve) => {
    const parentEmail = parent?.email || `${student?.name?.toLowerCase()?.replace(/\s+/g, '.')}@gmail.com`;
    const subject = `📢 [ICode Academy] Student Observation Report: ${student?.name} - ${activity.title}`;
    
    // Simulate Future-Ready Email Delivery Payload
    const mailPayload = {
      meta: {
        gateway: "ICode Email Service Agent",
        timestamp: new Date().toISOString(),
        deliveryType: "observation_alert"
      },
      envelope: {
        from: "ICode Notification Hub <noreply@icode.edu>",
        to: `${parent?.name || 'Parent'} <${parentEmail}>`,
        subject: subject,
        replyTo: teacher?.email || 'faculty@icode.edu'
      },
      template: {
        name: "student_daily_activity_observed",
        variables: {
          parentName: parent?.name || 'Parent',
          studentName: student?.name,
          studentAge: student?.age,
          classroomName: classroom ? `${classroom.name}-${classroom.section}` : 'N/A',
          activityTitle: activity.title,
          activityDescription: activity.description,
          activityDate: formatDateString(activity.date || new Date()),
          teacherSignature: teacher?.name || 'Classroom Instructor',
          teacherSubject: teacher?.subject || 'ICode Faculty Member',
          attachmentUrl: activity.customPhoto || `[Preset Illustration Theme: ${activity.photoPreset}]`
        }
      }
    };

    // Format Console logs
    console.log(
      `%c[MOCK EMAIL PREPARED] %cTo: ${parentEmail} | Payload Compiled`,
      'color: #10b981; font-weight: bold; font-size: 13px;',
      'color: #ec4899; font-weight: normal;'
    );
    console.log(JSON.stringify(mailPayload, null, 2));

    const receipt = {
      id: `mail-draft-${Date.now()}`,
      to: parentEmail,
      parentName: parent?.name || 'Parent',
      studentName: student?.name || 'Student',
      subject: subject,
      activityTitle: activity.title,
      date: new Date().toISOString(),
      status: 'Payload Sent (Mock Delivery)'
    };

    setTimeout(() => {
      resolve(receipt);
    }, 250);
  });
};

function formatDateString(dVal) {
  const d = new Date(dVal);
  if (isNaN(d.getTime())) return String(dVal);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
