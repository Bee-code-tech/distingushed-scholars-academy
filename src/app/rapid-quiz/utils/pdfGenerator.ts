// // src/app/rapid-quiz/utils/pdfGenerator.ts
// // PDF Generation Utility using jsPDF and jspdf-autotable
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'

// export const downloadPDF = (
//   userScore: number,
//   quizData: any[],
//   correctCount: number,
//   secondsUsed: number,
//   subjectStats: any[],
// ) => {
//   const doc = new jsPDF()

//   const addWatermark = (pdf: any) => {
//     const totalPages = pdf.internal.getNumberOfPages()
//     for (let i = 1; i <= totalPages; i++) {
//       pdf.setPage(i)
//       pdf.saveGraphicsState()
//       pdf.setGState(new (pdf as any).GState({ opacity: 0.15 }))
//       pdf.setFontSize(35)
//       pdf.setTextColor(150)
//       pdf.text('Distinguished Scholars Academy', 40, 190, { angle: 45 })
//       pdf.restoreGraphicsState()
//     }
//   }

//   // Header & Branding
//   doc.addImage('/imges/DSA.jpg', 'JPEG', 92.5, 10, 25, 25)
//   doc.setFontSize(20)
//   doc.setTextColor(0, 46, 255)
//   doc.text('Distinguished Scholars Academy', 105, 45, { align: 'center' })

//   doc.setFontSize(12)
//   doc.setTextColor(100)
//   doc.text('Examination Result Report', 105, 52, { align: 'center' })

//   // Main Performance Table
//   autoTable(doc, {
//     startY: 60,
//     head: [['Metric', 'Value']],
//     body: [
//       ['Overall Score', `${userScore}%`],
//       ['Total Questions', quizData.length.toString()],
//       ['Correct Answers', correctCount.toString()],
//       ['Time Taken', `${Math.floor(secondsUsed / 60)}m ${secondsUsed % 60}s`],
//     ],
//     headStyles: { fillColor: [0, 46, 255] },
//     didDrawPage: () => addWatermark(doc),
//   })

//   // Subject Breakdown Table
//   autoTable(doc, {
//     startY: (doc as any).lastAutoTable.finalY + 10,
//     head: [['Subject', 'Score', 'Total', 'Percentage']],
//     body: subjectStats.map((s) => [
//       s.name,
//       s.correct,
//       s.total,
//       `${s.percent}%`,
//     ]),
//     headStyles: { fillColor: [31, 41, 55] },
//   })

//   doc.save('DSA_Quiz_Result.pdf')
// }




// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'

// /**
//  * Helper to convert image path to Base64
//  * Ensures the PDF doesn't attempt to render before the image is ready
//  */
// const getBase64Image = (url: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image()
//     img.crossOrigin = 'Anonymous'
//     img.onload = () => {
//       const canvas = document.createElement('canvas')
//       canvas.width = img.width
//       canvas.height = img.height
//       const ctx = canvas.getContext('2d')
//       ctx?.drawImage(img, 0, 0)
//       resolve(canvas.toDataURL('image/jpeg'))
//     }
//     img.onerror = () => reject(new Error('Image load failed'))
//     img.src = url
//   })
// }

// export const downloadPDF = async (
//   userScore: number,
//   quizData: any[],
//   correctCount: number,
//   secondsUsed: number,
//   subjectStats: any[],
// ) => {
//   const doc = new jsPDF()

//   /**
//    * Watermark Logic
//    * Fixed: Sets opacity via GState instead of TextOptionsLight
//    */
//   const addWatermark = (pdf: any) => {
//     pdf.saveGraphicsState()
//     const state = new pdf.GState({ opacity: 0.1 })
//     pdf.setGState(state)
//     pdf.setFontSize(40)
//     pdf.setTextColor(150, 150, 150)
//     // Removed 'opacity' from options to fix TypeScript error
//     pdf.text('DISTINGUISHED SCHOLARS ACADEMY', 105, 160, {
//       angle: 45,
//       align: 'center',
//     })
//     pdf.restoreGraphicsState()
//   }

//   try {
//     // 1. Branding Header
//     try {
//       const logoData = await getBase64Image('/imges/DSA.jpg')
//       doc.addImage(logoData, 'JPEG', 92.5, 10, 25, 25)
//     } catch (e) {
//       console.warn('Logo not found, skipping branding image')
//     }

//     doc.setFontSize(18)
//     doc.setTextColor(0, 46, 255) // DSA Blue
//     doc.text('Distinguished Scholars Academy', 105, 45, { align: 'center' })

//     doc.setFontSize(10)
//     doc.setTextColor(100)
//     doc.text('Official Examination Performance Report', 105, 52, {
//       align: 'center',
//     })

//     // 2. Primary Metrics Table
//     autoTable(doc, {
//       startY: 62,
//       head: [['Assessment Metric', 'Analysis Result']],
//       body: [
//         ['Overall Proficiency Score', `${userScore}%`],
//         ['Total Questions Attempted', quizData.length.toString()],
//         ['Accuracy (Correct Responses)', correctCount.toString()],
//         [
//           'Completion Time',
//           `${Math.floor(secondsUsed / 60)}m ${secondsUsed % 60}s`,
//         ],
//       ],
//       headStyles: { fillColor: [0, 46, 255], fontStyle: 'bold' },
//       theme: 'striped',
//       didDrawPage: (data) => addWatermark(doc),
//     })

//     // 3. Subject Breakdown Table
//     const finalY = (doc as any).lastAutoTable.finalY
//     autoTable(doc, {
//       startY: finalY + 10,
//       head: [['Subject Module', 'Correct', 'Total', 'Proficiency %']],
//       body: subjectStats.map((s) => [
//         s.name.toUpperCase(),
//         s.correct,
//         s.total,
//         `${s.percent}%`,
//       ]),
//       headStyles: { fillColor: [31, 41, 55] }, // Dark slate
//       theme: 'grid',
//       styles: { fontSize: 9 },
//     })

//     // 4. Footer & Page Numbering (The Fix)
//     // Access getNumberOfPages() directly on the 'doc' instance
//     const pageCount = doc.getNumberOfPages()

//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i)
//       doc.setFontSize(8)
//       doc.setTextColor(150)

//       // Standard footer text
//       const footerText = `Generated on ${new Date().toLocaleString()} • Page ${i} of ${pageCount}`

//       doc.text(
//         footerText,
//         105, // Center X
//         287, // Bottom Y
//         { align: 'center' },
//       )
//     }

//     doc.save(`DSA_Report_${Date.now()}.pdf`)

//   } catch (error) {
//     console.error('PDF Generation Failed:', error)
//   }
// }

// src/app/rapid-quiz/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getBase64Image = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(''); // Silent fail to allow PDF without logo
    img.src = url;
  });
};

export const downloadPDF = async (
  userScore: number,
  quizData: any[],
  correctCount: number,
  secondsUsed: number,
  subjectStats: any[],
) => {
  const doc = new jsPDF();

  const addWatermark = (pdf: any) => {
    pdf.saveGraphicsState();
    const state = new pdf.GState({ opacity: 0.1 });
    pdf.setGState(state);
    pdf.setFontSize(40);
    pdf.setTextColor(150);
    pdf.text('DSA OFFICIAL REPORT', 105, 160, { angle: 45, align: 'center' });
    pdf.restoreGraphicsState();
  };

  const logo = await getBase64Image('/imges/DSA.jpg');
  if (logo) doc.addImage(logo, 'JPEG', 92.5, 10, 25, 25);

  doc.setFontSize(18);
  doc.setTextColor(0, 46, 255);
  doc.text('Distinguished Scholars Academy', 105, 45, { align: 'center' });

  autoTable(doc, {
    startY: 60,
    head: [['Metric', 'Value']],
    body: [
      ['Overall Score', `${userScore}%`],
      ['Total Questions', quizData.length.toString()],
      ['Correct Answers', correctCount.toString()],
      ['Time Taken', `${Math.floor(secondsUsed / 60)}m ${secondsUsed % 60}s`],
    ],
    headStyles: { fillColor: [0, 46, 255] },
    didDrawPage: () => addWatermark(doc),
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Subject', 'Score', 'Total', 'Percentage']],
    body: subjectStats.map((s) => [s.name, s.correct, s.total, `${s.percent}%`]),
    headStyles: { fillColor: [31, 41, 55] },
  });

  // Footer fix
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
  }

  doc.save(`DSA_Result_${Date.now()}.pdf`);
};