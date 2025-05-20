// src/data/dummyUsers.js
const dummyUsers = [];

const branches = ['CSE', 'ECE', 'MECH', 'CIVIL'];
const skillsList = ['Java', 'React', 'Node.js', 'Python', 'Machine Learning', 'AutoCAD', 'SolidWorks', 'CATIA', 'Civil 3D', 'SQL', 'Django', 'Angular', 'Flutter', 'TensorFlow'];

for (let i = 1; i <= 300; i++) {
  const branch = branches[Math.floor(Math.random() * branches.length)];
  const skills = [];
  const skillCount = Math.floor(Math.random() * 3) + 1;
  for (let j = 0; j < skillCount; j++) {
    skills.push(skillsList[Math.floor(Math.random() * skillsList.length)]);
  }

  dummyUsers.push({
    name: `Student ${i}`,
    regNo: `2020${branch}${i.toString().padStart(3, '0')}`,
    branch: branch,
    placement: Math.random() > 0.3 ? 'Yes' : 'No',
    arrears: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0, // ✅ Arrears is now a number
    historyArrears: Math.random() > 0.7 ? 'Yes' : 'No',
    cgpa: (Math.random() * 4 + 6).toFixed(2),
    skills: skills,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    dob: `1999-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    email: `student${i}@example.com`,
    mobile: `98765${Math.floor(100000 + Math.random() * 899999)}`,
    address: `${i} College Street, City ${i}`,
    photo: '', // you can add default profile photo if needed
  });
}

export default dummyUsers;
