import { Halaqah, Student, AttendanceRecord } from '../types';

export interface ParseResult {
  success: boolean;
  detectedHalaqah?: Halaqah;
  absentSerials: number[];
  absentStudents: Student[];
  allPresent: boolean;
  rawText: string;
  errorMessage?: string;
  presentCount?: number;
  recitedCount?: number;
  didNotReciteCount?: number;
}

export interface StudentCommandResult {
  isEnrollCommand: boolean;
  isDeleteCommand: boolean;
  studentName?: string;
  age?: number;
  halaqah?: Halaqah;
  deleteSerial?: number;
}

// Convert Eastern Arabic numerals (١، ٢، ٣) to Western (1, 2, 3)
export function normalizeArabicNumbers(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (w) => arabicNumerals.indexOf(w).toString());
}

/**
 * Checks if incoming message is a command to enroll or delete a student.
 * Examples:
 * - "تسجيل طالب: عبد الرحمن الدوسري، عمره 11، حلقة ابن مسعود"
 * - "طالب جديد: فيصل السبيعي، 14 سنة، حلقة أبي بن كعب"
 * - "إضافة طالب: أحمد القحطاني، عمره 8"
 * - "حذف طالب رقم 4 من حلقة عثمان"
 */
export function parseStudentCommand(
  messageText: string,
  senderPhone: string,
  allHalaqat: Halaqah[]
): StudentCommandResult {
  const normalized = normalizeArabicNumbers(messageText.trim());

  // 1. Check for enrollment keywords
  const enrollKeywords = ['تسجيل طالب', 'اضافة طالب', 'إضافة طالب', 'طالب جديد', 'سجل طالب'];
  const hasEnroll = enrollKeywords.some((kw) => normalized.includes(kw));

  // 2. Check for delete keywords
  const deleteKeywords = ['حذف طالب', 'احذف طالب', 'فصل طالب', 'الغاء طالب', 'إلغاء طالب'];
  const hasDelete = deleteKeywords.some((kw) => normalized.includes(kw));

  // Determine halaqah
  const cleanSenderPhone = senderPhone.replace(/\D/g, '');
  let detectedHalaqah = cleanSenderPhone
    ? allHalaqat.find((h) => h.teacherPhone.replace(/\D/g, '') === cleanSenderPhone)
    : undefined;
  if (!detectedHalaqah) {
    for (const h of allHalaqat) {
      const nameParts = h.name.replace(/(حلقة|رضي الله عنه|بن)/g, '').trim().split(/\s+/);
      const teacherParts = (h.teacherName || '').replace(/(أ\.|\/)/g, ' ').trim().split(/\s+/);
      const isMatch =
        nameParts.some((part) => part.length >= 3 && normalized.includes(part)) ||
        teacherParts.some((part) => part.length >= 3 && normalized.includes(part));
      if (isMatch) {
        detectedHalaqah = h;
        break;
      }
    }
  }
  if (!detectedHalaqah) detectedHalaqah = allHalaqat[0];

  if (hasEnroll) {
    // Extract age (e.g. عمره 12, 12 سنة, عمر 10)
    let extractedAge = 12;
    const ageMatch = normalized.match(/(?:عمر(?:ه)?|سن(?:ه)?)\s*:?\s*(\d{1,2})|\b(\d{1,2})\s*(?:سنوات|سنة)/);
    if (ageMatch) {
      extractedAge = parseInt(ageMatch[1] || ageMatch[2], 10);
    }

    // Extract student name
    // Strip prefix keywords
    let cleanText = normalized;
    enrollKeywords.forEach((kw) => {
      cleanText = cleanText.replace(kw, '');
    });
    // Remove halaqah mentions and age phrases
    cleanText = cleanText
      .replace(/(?:عمر(?:ه)?|سن(?:ه)?)\s*:?\s*\d{1,2}(?:\s*(?:سنوات|سنة))?/g, '')
      .replace(/\b\d{1,2}\s*(?:سنوات|سنة)/g, '')
      .replace(/(?:حلقة|في حلقة|بحلقة)\s*[\u0600-\u06FF\s]+/g, '')
      .replace(/[:،,]/g, ' ')
      .trim();

    const nameParts = cleanText.split(/\s+/).filter((p) => p.length > 1 && !['جديد', 'عمره', 'سنة', 'في'].includes(p));
    const studentName = nameParts.slice(0, 4).join(' ') || 'طالب جديد';

    return {
      isEnrollCommand: true,
      isDeleteCommand: false,
      studentName,
      age: extractedAge,
      halaqah: detectedHalaqah,
    };
  }

  if (hasDelete) {
    // Extract serial number to delete
    const serialMatch = normalized.match(/(?:رقم|تسلسل|طالب)\s*:?\s*(\d{1,2})/);
    const deleteSerial = serialMatch ? parseInt(serialMatch[1], 10) : undefined;

    return {
      isEnrollCommand: false,
      isDeleteCommand: true,
      deleteSerial,
      halaqah: detectedHalaqah,
    };
  }

  return {
    isEnrollCommand: false,
    isDeleteCommand: false,
  };
}

/**
 * Intelligent WhatsApp Parser for Teacher messages.
 * Handles patterns like:
 * - "غياب حلقة أبي بن كعب: 2، 4، 7"
 * - "غائب: 1, 3"
 * - "حضور كامل لحلقة زيد بن ثابت اليوم"
 * - "الغياب اليوم بحلقة عثمان: 4 وعبد الملك"
 */
export function parseTeacherAttendanceMessage(
  messageText: string,
  senderPhone: string,
  allHalaqat: Halaqah[],
  allStudents: Student[]
): ParseResult {
  const normalized = normalizeArabicNumbers(messageText.trim());

  // 1. Try to detect halaqah from teacher phone first
  const cleanSenderPhone = senderPhone.replace(/\D/g, '');
  let detectedHalaqah = cleanSenderPhone
    ? allHalaqat.find((h) => h.teacherPhone.replace(/\D/g, '') === cleanSenderPhone)
    : undefined;

  // 2. If not found by phone, detect by halaqah name or teacher name in message text
  if (!detectedHalaqah) {
    const textLower = normalized.toLowerCase();
    for (const h of allHalaqat) {
      const nameParts = h.name.replace(/(حلقة|رضي الله عنه|بن)/g, '').trim().split(/\s+/);
      const teacherParts = (h.teacherName || '').replace(/(أ\.|\/)/g, ' ').trim().split(/\s+/);
      const isMatch =
        nameParts.some((part) => part.length >= 3 && textLower.includes(part.toLowerCase())) ||
        teacherParts.some((part) => part.length >= 3 && textLower.includes(part.toLowerCase()));
      if (isMatch) {
        detectedHalaqah = h;
        break;
      }
    }
  }

  // Fallback to first halaqah if still not detected
  if (!detectedHalaqah) {
    detectedHalaqah = allHalaqat[0];
  }

  // Get active students for this halaqah
  const halaqahStudents = allStudents.filter((s) => s.halaqahId === detectedHalaqah!.id && s.status === 'active');

  // Check for "all present" phrases
  const allPresentKeywords = ['حضور كامل', 'الجميع حاضر', 'لا يوجد غياب', 'لا غياب', 'الكل حاضر', 'حضور تام', '100%'];
  const isAllPresent = allPresentKeywords.some((kw) => normalized.includes(kw));

  if (isAllPresent) {
    return {
      success: true,
      detectedHalaqah,
      absentSerials: [],
      absentStudents: [],
      allPresent: true,
      rawText: messageText,
    };
  }

  // Extract serial numbers (1 to 30)
  const absentSerials: number[] = [];
  const absentStudents: Student[] = [];

  // Match all isolated digits or lists of numbers like "2, 4, 7" or "2 و 5"
  const numberRegex = /\b([1-9]|[12][0-9]|30)\b/g;
  const matches = normalized.match(numberRegex);

  if (matches) {
    matches.forEach((m) => {
      const num = parseInt(m, 10);
      if (num >= 1 && num <= 50 && !absentSerials.includes(num)) {
        absentSerials.push(num);
      }
    });
  }

  // Find students by extracted serials
  absentSerials.forEach((serial) => {
    const student = halaqahStudents.find((s) => s.halaqahSerial === serial);
    if (student && !absentStudents.some((s) => s.id === student.id)) {
      absentStudents.push(student);
    }
  });

  // Extract absent names in parentheses like: غياب 2 (أحمد، خالد)
  const parenMatch = normalized.match(/(?:غياب|غائب)\s*\d*\s*\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const rawTokens = parenMatch[1]
      .split(/[،,و]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && !['طالب', 'طلاب'].includes(s));

    rawTokens.forEach((token) => {
      const foundStu = halaqahStudents.find(
        (s) => s.fullName.includes(token) || token.includes(s.fullName.split(' ')[0])
      );
      if (foundStu && !absentStudents.some((s) => s.id === foundStu.id)) {
        absentStudents.push(foundStu);
        if (!absentSerials.includes(foundStu.halaqahSerial)) {
          absentSerials.push(foundStu.halaqahSerial);
        }
      }
    });
  }

  // Extract absent names from structured lines: الغائبون: سعد، خالد
  const absentLineMatch = normalized.match(/(?:الغائبون|غائبون|الغياب)\s*[:\-]?\s*([^\n\r]+)/);
  if (absentLineMatch && absentLineMatch[1]) {
    const absentLine = absentLineMatch[1].trim();
    if (!['لا يوجد', 'لايوجد', 'صفر', 'لا', 'لاشيء'].includes(absentLine)) {
      const tokens = absentLine
        .split(/[،,و\n]+/)
        .map((s) => s.trim().replace(/^[\-•*]\s*/, ''))
        .filter((s) => s.length > 1 && !['طالب', 'طلاب'].includes(s));

      tokens.forEach((token) => {
        const foundStu = halaqahStudents.find(
          (s) => s.fullName.includes(token) || token.includes(s.fullName.split(' ')[0])
        );
        if (foundStu && !absentStudents.some((s) => s.id === foundStu.id)) {
          absentStudents.push(foundStu);
          if (!absentSerials.includes(foundStu.halaqahSerial)) {
            absentSerials.push(foundStu.halaqahSerial);
          }
        }
      });
    }
  }

  // Also check if any student's name was explicitly written in the message
  halaqahStudents.forEach((student) => {
    const nameTokens = student.fullName.split(/\s+/).filter((t) => t.length > 2 && t !== 'بن' && t !== 'عبد');
    const matchedTokens = nameTokens.filter((token) => normalized.includes(token));
    if (matchedTokens.length >= 2 && !absentStudents.some((s) => s.id === student.id)) {
      // Only treat as absent if explicitly located in absent context or no present section
      if (normalized.includes('غياب') || normalized.includes('غائب')) {
        absentStudents.push(student);
        if (!absentSerials.includes(student.halaqahSerial)) {
          absentSerials.push(student.halaqahSerial);
        }
      }
    }
  });

  // Extract counts: حضور X، سمّع Y، لم يسمّع Z
  let presentCount = halaqahStudents.length - absentStudents.length;
  const presentMatch = normalized.match(/حضور\s*:?\s*(\d+)|(\d+)\s*حضور/);
  if (presentMatch) {
    presentCount = parseInt(presentMatch[1] || presentMatch[2], 10);
  } else {
    // Check structured line: الحاضرون: أحمد، خالد، ...
    const presentLineMatch = normalized.match(/(?:الحاضرون|حاضرون|الحضور)\s*[:\-]?\s*([^\n\r]+)/);
    if (presentLineMatch && presentLineMatch[1]) {
      const pTokens = presentLineMatch[1]
        .split(/[،,و\n]+/)
        .map((s) => s.trim().replace(/^[\-•*]\s*/, ''))
        .filter((s) => s.length > 1 && !['طالب', 'طلاب'].includes(s));
      if (pTokens.length > 0) {
        presentCount = pTokens.length;
      }
    }
  }

  let recitedCount = presentCount;
  const reciteMatch = normalized.match(/(?:سمّع|سمع|تسميع)\s*:?\s*(\d+)/);
  if (reciteMatch) {
    recitedCount = parseInt(reciteMatch[1], 10);
  } else {
    // Check structured line: السمّيعة: أحمد، خالد
    const recitedLineMatch = normalized.match(/(?:السمّيعة|السميعة)\s*[:\-]?\s*([^\n\r]+)/);
    if (recitedLineMatch && recitedLineMatch[1]) {
      const rTokens = recitedLineMatch[1]
        .split(/[،,و\n]+/)
        .map((s) => s.trim().replace(/^[\-•*]\s*/, ''))
        .filter((s) => s.length > 1 && !['طالب', 'طلاب'].includes(s));
      if (rTokens.length > 0) {
        recitedCount = rTokens.length;
      }
    }
  }

  // Strictly enforce recitedCount <= presentCount (cannot exceed attended count)
  presentCount = Math.max(0, Math.min(presentCount, halaqahStudents.length));
  recitedCount = Math.max(0, Math.min(recitedCount, presentCount));

  let didNotReciteCount = Math.max(0, presentCount - recitedCount);
  const notReciteMatch = normalized.match(/لم\s*(?:يسمّع|يسمع|يسمعوا|يسمّعوا)\s*:?\s*(\d+)/);
  if (notReciteMatch) {
    didNotReciteCount = Math.max(0, Math.min(parseInt(notReciteMatch[1], 10), presentCount - recitedCount));
  }

  return {
    success: true,
    detectedHalaqah,
    absentSerials: absentSerials.sort((a, b) => a - b),
    absentStudents,
    allPresent: absentStudents.length === 0,
    rawText: messageText,
    presentCount,
    recitedCount,
    didNotReciteCount,
  };
}

/**
 * Generates the official detailed final daily attendance and recitation report for the supervisor / director via WhatsApp.
 * يحتوي على:
 * - التاريخ اليومي بتنسيق دقيق (مثال: الخميس، 12 أكتوبر 2026).
 * - أسماء الحضور والغياب للطلاب لكل حلقة.
 * - إحصائية دقيقة: كم طالب سمّع اليوم في الحلقة، وكم طالب لم يسمع.
 */
export function generateConsolidatedWhatsAppReport(
  dateStr: string,
  allHalaqat: Halaqah[],
  allStudents: Student[],
  allAttendance: AttendanceRecord[]
): string {
  // Arabic day and date formatting (مثال: الخميس، 12 أكتوبر 2026)
  const arabicDate = new Date(dateStr).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalStudents = allStudents.filter((s) => s.status === 'active').length;
  let totalAttended = 0;
  let totalOnTime = 0;
  let totalLate = 0;
  let totalAbsent = 0;
  let totalExcused = 0;
  let totalRecited = 0;
  let totalNotRecited = 0;

  const halaqatSections: string[] = [];

  allHalaqat.forEach((halaqah) => {
    const halaqahStudents = allStudents
      .filter((s) => s.halaqahId === halaqah.id && s.status === 'active')
      .sort((a, b) => a.halaqahSerial - b.halaqahSerial);

    const presentInHalaqah: Array<{ student: Student; recited: boolean; isLate: boolean; amount?: string }> = [];
    const absentInHalaqah: Student[] = [];
    const excusedInHalaqah: Student[] = [];

    let halaqahRecitedCount = 0;
    let halaqahNotRecitedCount = 0;

    halaqahStudents.forEach((stu) => {
      const rec = allAttendance.find((a) => a.studentId === stu.id && a.date === dateStr);
      const status = rec ? rec.status : 'present';
      const isAttended = status === 'present' || status === 'late';
      // Absent or excused students can NEVER be counted as recited
      const didRecite = isAttended && (rec && rec.recited !== undefined ? rec.recited : true);

      if (status === 'absent') {
        absentInHalaqah.push(stu);
        totalAbsent++;
      } else if (status === 'excused') {
        excusedInHalaqah.push(stu);
        totalExcused++;
      } else {
        totalAttended++;
        if (status === 'late') totalLate++;
        else totalOnTime++;

        presentInHalaqah.push({
          student: stu,
          recited: didRecite,
          isLate: status === 'late',
          amount: rec?.recitationAmount,
        });

        if (didRecite) {
          halaqahRecitedCount++;
          totalRecited++;
        } else {
          halaqahNotRecitedCount++;
          totalNotRecited++;
        }
      }
    });

    let section = `✨ *${halaqah.name}*\n`;
    section += `👤 المعلم المسؤول: ${halaqah.teacherName}\n`;
    section += `👥 إجمالي طلاب الحلقة: ${halaqahStudents.length} طلاب\n\n`;

    // 1. أسماء الحضور (بالوقت + المتأخرون)
    if (presentInHalaqah.length > 0) {
      section += `🟢 *أسماء الحاضرين (${presentInHalaqah.length}):*\n`;
      presentInHalaqah.forEach((item, idx) => {
        const lateTag = item.isLate ? ' (متأخر ⏳)' : '';
        const reciteTag = item.recited ? ' [سمّع اليوم ✓]' : ' [لم يُسمّع بعد ⏳]';
        section += `  ${idx + 1}. [${item.student.halaqahSerial}] ${item.student.fullName}${lateTag}${reciteTag}\n`;
      });
      section += `\n`;
    } else {
      section += `🟢 *أسماء الحاضرين:* لا يوجد طلاب حضور اليوم.\n\n`;
    }

    // 2. أسماء الغياب
    if (absentInHalaqah.length > 0) {
      section += `🔴 *أسماء الغائبين (${absentInHalaqah.length}):*\n`;
      absentInHalaqah.forEach((st, idx) => {
        section += `  ${idx + 1}. [${st.halaqahSerial}] ${st.fullName}\n`;
      });
      section += `\n`;
    } else {
      section += `🔴 *أسماء الغائبين:* لا يوجد غياب (حضور كامل) ما شاء الله.\n\n`;
    }

    // 3. المستأذنون بعذر
    if (excusedInHalaqah.length > 0) {
      section += `🟡 *المستأذنون بعذر (${excusedInHalaqah.length}):*\n`;
      excusedInHalaqah.forEach((st, idx) => {
        section += `  ${idx + 1}. [${st.halaqahSerial}] ${st.fullName}\n`;
      });
      section += `\n`;
    }

    // 4. إحصائية التسميع الدقيقة (المسمّعون لا يتجاوزون الحاضرين)
    section += `📖 *إحصائية التسميع في ${halaqah.name}:*\n`;
    section += `  • عدد من سمّع اليوم: *${halaqahRecitedCount}* من أصل ${presentInHalaqah.length} حاضر 🟢\n`;
    section += `  • عدد من لم يُسمّع: *${halaqahNotRecitedCount}* طالب ⏳\n`;

    halaqatSections.push(section);
  });

  const attendanceRate = totalStudents > 0 ? ((totalAttended / totalStudents) * 100).toFixed(1) : '100';

  const report = `🌿 *حلقات ابن باز لتحفيظ القرآن الكريم* 🌿
📋 *التقرير اليومي الختامي والمفصل*
📅 *التاريخ:* ${arabicDate}

═════════════════════════
${halaqatSections.join('\n═════════════════════════\n')}
═════════════════════════
📊 *الإحصائية العامة الختامية:*
• 👥 إجمالي عدد الطلاب: ${totalStudents} طالب
• 🟢 إجمالي الحضور: *${totalAttended}* طالب (${attendanceRate}% — بالموعد: ${totalOnTime} | متأخر: ${totalLate})
• 🔴 إجمالي الغياب: *${totalAbsent}* طلاب
• 🟡 إجمالي المستأذنين: *${totalExcused}* طلاب
• 📖 إجمالي من سمّع الورد اليوم: *${totalRecited}* من أصل ${totalAttended} حاضر 🟢
• ⏳ إجمالي من لم يُسمّع: *${totalNotRecited}* طالب ⏳

نسأل الله العلي القدير أن يبارك في جهود المشرفين والطلاب وأن يجعل القرآن العظيم ربيع قلوبهم.
_إدارة حلقات ابن باز_`;

  return report;
}

/**
 * Generates single-student parent notification message using the exact respected formula requested:
 * "وعليكم السلام ورحمة الله وبركاته، نود إفادتكم بتسجيل غياب ابنكم عن حلقة تحفيظ القرآن الكريم لهذا اليوم. نسأل الله أن يكتب أجره وحفظه، ونأمل حرصه على استمرار الانضباط المبارك في كتاب الله. شكراً لتعاونكم معنا."
 */
export function generateParentAlertMessage(
  student: Student,
  halaqah: Halaqah,
  dateStr: string
): string {
  return `وعليكم السلام ورحمة الله وبركاته،
المكرم ولي أمر الطالب/ *${student.fullName}* حفظكم الله،

نود إفادتكم بتسجيل غياب ابنكم عن حلقة تحفيظ القرآن الكريم (*${halaqah.name}*) لهذا اليوم.
نسأل الله أن يكتب أجره وحفظه، ونأمل حرصه على استمرار الانضباط المبارك في كتاب الله.

شكراً لتعاونكم معنا.
_إدارة حلقات ابن باز_`;
}

// Alias for consolidated report
export const generateConsolidatedTelegramReport = generateConsolidatedWhatsAppReport;
