import { supabase } from './supabase.js';

const STUDENTS = [
  { id: "arucan",      last_name: "Arucan",      first_name: "John Limp",       hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "baruela",     last_name: "Baruela",     first_name: "Shaun Yuri",      hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "benedicto",   last_name: "Benedicto",   first_name: "Obi James",       hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "bulawan",     last_name: "Bulawan",     first_name: "Czyane Justine",  hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "castuera",    last_name: "Castuera",    first_name: "Lanszkie Gerald", hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "catignas",    last_name: "Catignas",    first_name: "Rosriel",         hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "catolos",     last_name: "Catolos",     first_name: "Ruel",            hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "caya",        last_name: "Caya",        first_name: "Wesley",          hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "domingo",     last_name: "Domingo",     first_name: "John Andrei",     hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "duquez",      last_name: "Duquez",      first_name: "Ernesto",         hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "ebcas",       last_name: "Ebcas",       first_name: "Asheiah",         hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "felipe",      last_name: "Felipe",      first_name: "Rob Jaynard",     hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "garde",       last_name: "Garde",       first_name: "Renz Matthew",    hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "hernandez",   last_name: "Hernandez",   first_name: "Heart Ian",       hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "labuson",     last_name: "Labuson",     first_name: "Sophea",          hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "lanciso",     last_name: "Lanciso",     first_name: "John Lawrence",   hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "lapus",       last_name: "Lapus",       first_name: "Iñigo Vladimir",  hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "lapuz",       last_name: "Lapuz",       first_name: "David",           hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "manansala",   last_name: "Manansala",   first_name: "Exequiel John",   hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "martin",      last_name: "Martin",      first_name: "Jasmine Alexa",   hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "mejia",       last_name: "Mejia",       first_name: "Kian Clark",      hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "merelos",     last_name: "Merelos",     first_name: "Eljohn",          hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "miclat",      last_name: "Miclat",      first_name: "John Simon",      hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "midayanes",   last_name: "Midayanes",   first_name: "Larsen",          hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "morgadez",    last_name: "Morgadez",    first_name: "Daniella Elize",  hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "nellas",      last_name: "Nellas",      first_name: "James Arron",     hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "nimo",        last_name: "Nimo",        first_name: "Cristel Ann",     hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "pagco",       last_name: "Pagco",       first_name: "Ezekiel",         hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "pantig",      last_name: "Pantig",      first_name: "John Mark",       hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "papellero",   last_name: "Papellero",   first_name: "Jomar",           hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "perez",       last_name: "Perez",        first_name: "Matthew",        hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "pingol",      last_name: "Pingol",      first_name: "Sean Patrick",    hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "rianzares",   last_name: "Rianzares",   first_name: "John Isaac",      hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "rodriguez",   last_name: "Rodriguez",   first_name: "Cedric Ryle",     hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "veluz",       last_name: "Veluz",       first_name: "Franco Julian",   hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "villegas",    last_name: "Villegas",    first_name: "Gerald",          hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "zafe",        last_name: "Zafe",        first_name: "Xandler Yaries",  hours: 0, total: 80, days: 0, pin: "1234" },
  { id: "zapata",      last_name: "Zapata",      first_name: "Ayessa Denisse",  hours: 0, total: 80, days: 0, pin: "1234" },
];

async function seed() {
  const { error } = await supabase.from('students').upsert(STUDENTS);
  if (error) console.error('Seed failed:', error);
  else console.log('✓ All 38 students inserted!');
}

seed();