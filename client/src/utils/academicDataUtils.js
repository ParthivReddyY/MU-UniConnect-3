/**
 * Academic data structure containing the hierarchy of schools, programs, and departments
 * Extracted from multiple files to reduce redundancy
 */

export const academicStructure = {
  "École Centrale School of Engineering(ECSE)": {
    "B.Tech": [
      "AI (Artificial Intelligence)",
      "Biotechnology",
      "Computational Biology",
      "CSE (Computer Science and Engineering)",
      "Civil Engineering",
      "CM (Computation and Mathematics)",
      "ECM (Electronics and Computer Engineering)",
      "Mechanical Engineering (ME)",
      "Mechatronics (MT)",
      "Nanotechnology",
      "ECE (Electronics and Communication Engineering)",
      "Aerospace Engineering",
      "Electronic and Computer Engineering",
      "VLSI Design and Technology"
    ],
    "5 Year Integrated M.Tech": [
      "Computer Science and Engineering",
      "Biotechnology"
    ],
    "M.Tech": [
      "Autonomous Electric Vehicles (A-EV's)",
      "Computer-Aided Structural Engineering",
      "AI and Data Science",
      "Systems Engineering",
      "VLSI Design and Embedded Systems",
      "Smart Grid and Energy Storage Technologies",
      "Robotics",
      "Transportation Engineering",
      "Computational Mechanics",
      "Biomedical Data Science"
    ],
    "Ph.D.": [
      "Physics",
      "Civil Engineering",
      "Electrical and Computer Engineering",
      "Mathematics",
      "Mechanical and Aerospace Engineering",
      "Humanities and Social Sciences",
      "Life Sciences"
    ]
  },
  "School of Management(SOM)": {
    "BBA": [
      "BBA Applied Economics and Finance",
      "BBA Digital Technologies",
      "BBA Computational Business Analytics"
    ],
    "MBA": ["MBA"],
    "Ph.D.": [
      "Ph.D. in Economics",
      "Ph.D. in Finance",
      "Ph.D. in Decision Sciences",
      "Ph.D. in Marketing",
      "Ph.D. in Management (Strategy & Entrepreneurship, Organisational Behaviour & HRM)",
      "Ph.D. in Information Science and Technology"
    ]
  },
  "School Of Law(SOL)": {
    "BA.LL.B.": [
      "Corporate Law",
      "Business Laws",
      "Criminal Law",
      "International Law",
      "Intellectual Property Law",
      "Civil and Private Law",
      "Public Law"
    ],
    "B.B.A.LL.B.": [
      "Corporate Law",
      "Business Laws",
      "Criminal Law",
      "International Law",
      "Intellectual Property Law",
      "Civil and Private Law",
      "Public Law"
    ],
    "3-Years LL.B.(Hons.)": [
      "Corporate Law",
      "Business Laws",
      "Criminal Law",
      "International Law",
      "Intellectual Property Law",
      "Civil and Private Law",
      "Public Law"
    ],
    "B.Tech.-LL.B.(Hons.)": ["Integrated Dual-Degree"],
    "Ph.D.": [
      "Constitutional Law and Administrative Law",
      "Corporate Law and Business Law",
      "International Law",
      "Technology Law",
      "Air and Space Law",
      "Maritime and Defence Law"
    ]
  },
  "Indira Mahindra School of Education(IMSOE)": {
    "Master of Arts (M.A.) in Education": ["M.A. in Education"],
    "Ph.D.": [
      "School Education",
      "Higher Education",
      "Sociology of Education",
      "Educational Leadership and Management",
      "Psychology of Education",
      "Educational Innovations",
      "History of Education",
      "Economics of Education",
      "Teacher Education",
      "Educational Policy Studies",
      "Political Contexts of Education",
      "Curriculum and Pedagogical Studies",
      "Technology and Education"
    ]
  },
  "School of Digital Media and Communication(SDMC)": {
    "B.Tech (Computation and Media)": ["Computation and Media"],
    "Bachelor of Journalism and Mass Communication": ["Journalism and Mass Communication"],
    "MA in Journalism and Mass Communication": ["Journalism and Mass Communication"],
    "Ph.D.": [
      "Journalism Studies",
      "Media Studies",
      "Mass Communication",
      "Film and Television Studies",
      "Strategic Communication",
      "Media and Communication Management",
      "History, Technology and Systems of Media and Communication",
      "Ethics, Policies and Laws of Mediated Communication",
      "Human and Machine-Interface Communication"
    ]
  },
  "School of Design Innovation(SODI)": {
    "B.Des in Design Innovation": ["Design Innovation"],
    "M.Des in Design Innovation": ["Design Innovation"],
    "Ph.D.": [
      "Design Thinking",
      "Online and Scalable Design Education",
      "Design for Sustainability",
      "Design for Empathy in HCI"
    ]
  },
  "School of Hospitality Management(SOHM)": {
    "4-Yr B.Sc.(Hons.) Culinary and Hospitality Management": ["Culinary and Hospitality Management"]
  }
};

/**
 * Get a list of all schools
 * @returns {Array} Array of school names
 */
export const getSchools = () => {
  return Object.keys(academicStructure);
};

/**
 * Get programs for a specific school
 * @param {string} school School name
 * @returns {Array} Array of programs
 */
export const getPrograms = (school) => {
  if (!school || !academicStructure[school]) return [];
  return Object.keys(academicStructure[school]);
};

/**
 * Get departments/specializations for a specific school and program
 * @param {string} school School name
 * @param {string} program Program name
 * @returns {Array} Array of departments
 */
export const getDepartments = (school, program) => {
  if (!school || !program || !academicStructure[school] || !academicStructure[school][program]) return [];
  return academicStructure[school][program];
};

/**
 * Generate a list of academic years
 * @param {number} count Number of years to generate (default 10)
 * @returns {string[]} List of years as strings
 */
export const getAcademicYears = (count = 10) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => (currentYear - i).toString());
};

/**
 * Get department for a specific student by ID prefix
 * @param {string} studentId Student ID
 * @returns {string|null} Department name or null if not found
 */
export const getDepartmentByStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string' || studentId.length < 8) return null;
  
  // Extract the department code (e.g., UCSE from SE22UCSE123)
  const deptCode = studentId.substring(4, 8);
  
  // Map of common department codes to full names
  const deptMap = {
    'UCSE': 'CSE (Computer Science and Engineering)',
    'UECE': 'ECE (Electronics and Communication Engineering)',
    'UCVL': 'Civil Engineering',
    'UMEC': 'Mechanical Engineering (ME)',
    'UBIO': 'Biotechnology',
    'UAIN': 'AI (Artificial Intelligence)',
    // Add more mappings as needed
  };
  
  return deptMap[deptCode] || null;
};