import React from 'react';

const universities = [
  {
    name: 'Massachusetts Institute of Technology (MIT)',
    programs: ['Computer Science', 'Electrical Engineering'],
    requirements: ['High GPA', 'Standardized test scores']
  },
  {
    name: 'University of Oxford',
    programs: ['Philosophy', 'Politics'],
    requirements: ['A Levels', 'Personal Statement']
  },
  {
    name: 'University of Toronto',
    programs: ['Engineering', 'Business'],
    requirements: ['High School Diploma', 'English Proficiency']
  },
  {
    name: 'Technical University of Munich',
    programs: ['Computer Science', 'Mechanical Engineering'],
    requirements: ['A Levels', 'German Language Proficiency']
  },
  {
    name: 'University of Melbourne',
    programs: ['Arts', 'Computer Science'],
    requirements: ['ATAR', 'Personal Statement']
  },
  {
    name: 'ETH Zürich',
    programs: ['Architecture', 'Physics'],
    requirements: ['Matura', 'Entrance Exam']
  },
  {
    name: 'National University of Singapore',
    programs: ['Information Systems', 'Business'],
    requirements: ['High GPA', 'Standardized test scores']
  },
  {
    name: 'Delft University of Technology',
    programs: ['Engineering', 'Technology Management'],
    requirements: ['High School Diploma', 'English Proficiency']
  },
  {
    name: 'University College London',
    programs: ['Economics', 'Law'],
    requirements: ['A Levels', 'Personal Statement']
  },
  {
    name: 'McGill University',
    programs: ['Medical', 'Engineering'],
    requirements: ['High GPA', 'English Proficiency']
  },
  {
    name: 'University of Edinburgh',
    programs: ['Social Science', 'Engineering'],
    requirements: ['High School Diploma', 'Interview']
  },
  {
    name: 'Trinity College Dublin',
    programs: ['Liberal Arts', 'Engineering'],
    requirements: ['A Levels', 'Personal Statement']
  },
  {
    name: 'University of Auckland',
    programs: ['Arts', 'Science'],
    requirements: ['High School Diploma', 'Personal Statement']
  }
];

const UniversityListing = () => {
  return (
    <div>
      <h1>Universities</h1>
      <ul>
        {universities.map((university, index) => (
          <li key={index}>
            <h2>{university.name}</h2>
            <h3>Programs:</h3>
            <ul>
              {university.programs.map((program, i) => <li key={i}>{program}</li>)}}
            </ul>
            <h3>Requirements:</h3>
            <ul>
              {university.requirements.map((req, i) => <li key={i}>{req}</li>)}}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UniversityListing;