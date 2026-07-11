export type Question = {
  id: string
  year: number
  question: string
  options: string[]
  answer: number
  explanation: string
  topic?: string
  image?: string
}

export type SubjectData = {
  name: string
  bank: Question[]
}

export type ExamBank = Record<string, SubjectData>

export const pastQuestions: ExamBank = {
  Biology: {
    name: 'Biology',
    bank: [
      {
        id: 'B2023-1',
        year: 2023,
        topic: 'Cell Biology',
        question:
          'The process by which the Smooth Endoplasmic Reticulum facilitates the removal of drugs and poisons is known as?',
        options: [
          'Cellular Respiration',
          'Detoxification',
          'Oxidative Phosphorylation',
          'Protein Folding',
        ],
        answer: 1,
        explanation:
          'The Smooth ER contains enzymes that catalyze reactions to make drugs and poisons more water-soluble. This is prominent in liver cells.',
      },
      {
        id: 'B2023-3',
        year: 2022,
        topic: 'Genetics',
        question:
          'If a homozygous red-flowered plant (RR) is crossed with a homozygous white-flowered plant (rr) and the offspring are all pink, this is an example of?',
        options: [
          'Complete dominance',
          'Incomplete dominance',
          'Co-dominance',
          'Epistasis',
        ],
        answer: 1,
        explanation:
          'Incomplete dominance occurs when the phenotype of the heterozygous genotype (Rr) is an intermediate blend of the two homozygous phenotypes.',
      },
    ],
  },
  Chemistry: {
    name: 'Chemistry',
    bank: [
      {
        id: 'C2023-2',
        year: 2023,
        topic: 'Redox Reactions',
        question: 'What is the oxidation state of Manganese in KMnO4?',
        options: ['+2', '+5', '+7', '+4'],
        answer: 2,
        explanation:
          'In KMnO4: K(+1) + Mn + 4(-2) = 0. Solving for Mn: 1 + Mn - 8 = 0 -> Mn = +7.',
      },
      {
        id: 'C2022-5',
        year: 2022,
        topic: 'Organic Chemistry',
        question: 'The IUPAC name for the compound CH3CH2CH(CH3)OH is?',
        options: [
          'Butan-1-ol',
          'Butan-2-ol',
          '2-methylpropan-1-ol',
          'Pentan-2-ol',
        ],
        answer: 1,
        explanation:
          'The longest chain has 4 carbons (Butane) and the hydroxyl group is on the second carbon.',
      },
    ],
  },
  Physics: {
    name: 'Physics',
    bank: [
      {
        id: 'P2023-1',
        year: 2023,
        topic: 'Mechanics',
        question:
          'A body of mass 5kg is acted upon by a force of 20N. Calculate the acceleration.',
        options: ['2 m/s²', '4 m/s²', '100 m/s²', '0.25 m/s²'],
        answer: 1,
        explanation:
          "Using Newton's Second Law ($$F = ma$$), $$a = F/m$$. Therefore, $$20/5 = 4 m/s^2$$.",
      },
      {
        id: 'P2021-12',
        year: 2021,
        topic: 'Optics',
        question:
          'An object is placed 10cm in front of a concave mirror of focal length 15cm. The image formed is?',
        options: [
          'Real and inverted',
          'Virtual and erect',
          'Real and magnified',
          'Virtual and diminished',
        ],
        answer: 1,
        explanation:
          'When an object is placed between the pole and the principal focus ($$u < f$$) of a concave mirror, the image is virtual, erect, and magnified.',
      },
    ],
  },
  English: {
    name: 'Use of English',
    bank: [
      {
        id: 'E2023-1',
        year: 2023,
        topic: 'Synonyms',
        question:
          "Choose the option nearest in meaning to the underlined word: The lawyer's argument was **cogent**.",
        options: ['Weak', 'Convincing', 'Long', 'Useless'],
        answer: 1,
        explanation: 'Cogent means clear, logical, and convincing.',
      },
      {
        id: 'E2022-40',
        year: 2022,
        topic: 'Grammar',
        question:
          'The principal, as well as the teachers, _______ present at the meeting.',
        options: ['were', 'are', 'was', 'have been'],
        answer: 2,
        explanation:
          "When 'as well as' is used, the verb agrees with the first subject ('The principal'), which is singular.",
      },
    ],
  },
}
