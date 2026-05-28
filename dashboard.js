const API =
"https://lokomotiv-backend.onrender.com";

let events=[];

let selectedDate=null;

const calendar=
document.getElementById(
"calendar"
);

const monthTitle=
document.getElementById(
"monthTitle"
);

const modal=
document.getElementById(
"modal"
);

const modalDateTitle=
document.getElementById(
"modalDateTitle"
);

async function auth(){

const res=
await fetch(
`${API}/me`,
{

credentials:"include"

}
);

if(!res.ok){

location.href=
"personal.html";

}

}

auth();

async function loadEvents(){

const res=
await fetch(
`${API}/api/events`,
{

credentials:"include"

}
);

events=
await res.json();

renderCalendar();

}

function renderCalendar(){

calendar.innerHTML="";

const now=
new Date();

monthTitle.textContent=
now.toLocaleString(
"sv-SE",
{

month:"long",
year:"numeric"

}
);

const year=
now.getFullYear();

const month=
now.getMonth();

const days=
new Date(
year,
month+1,
0
).getDate();

for(
let i=1;
i<=days;
i++
){

const div=
document.createElement(
"div"
);

div.className=
"calendar-day";

div.innerHTML=
`
<div class="day-number">

${i}

</div>
`;

div.onclick=()=>{

selectedDate=
`${year}-${String(month+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;

modal.classList.remove(
"hidden"
);

modalDateTitle.textContent=
selectedDate;

renderDayEvents();

};

calendar.appendChild(
div
);

}

}

function renderDayEvents(){

const container=
document.getElementById(
"eventsContainer"
);

container.innerHTML="";

events
.filter(
e=>e.date===selectedDate
)
.forEach(
event=>{

container.innerHTML+=`

<div class="modal-event-card">

<h4>

${event.title}

</h4>

<p>

${event.time}

</p>

<p>

${event.description}

</p>

</div>

`;

});

}

document
.getElementById(
"eventForm"
)
.addEventListener(
"submit",

async e=>{

e.preventDefault();

await fetch(
`${API}/api/events`,
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

credentials:"include",

body:
JSON.stringify({

title:
eventTitle.value,

date:
selectedDate,

time:
eventTime.value,

description:
eventDescription.value

})

}

);

loadEvents();

renderDayEvents();

}

);

document
.getElementById(
"closeModal"
)
.onclick=()=>{

modal.classList.add(
"hidden"
);

};

async function loadMessages(){

const res=
await fetch(
`${API}/api/messages`,
{

credentials:"include"

}
);

const messages=
await res.json();

const container=
document.getElementById(
"messages"
);

container.innerHTML="";

messages.forEach(
message=>{

container.innerHTML+=`

<div class="message">

<div class="message-meta">

<strong>

${message.sender}

</strong>

<time>

${message.createdAt}

</time>

</div>

<p>

${message.text}

</p>

</div>

`;

});

}

document
.getElementById(
"messageForm"
)
.addEventListener(
"submit",

async e=>{

e.preventDefault();

await fetch(
`${API}/api/messages`,
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

credentials:"include",

body:
JSON.stringify({

text:
messageInput.value

})

}

);

messageInput.value="";

loadMessages();

}

);

document
.getElementById(
"logoutBtn"
)
.onclick=
async()=>{

await fetch(
`${API}/logout`,
{

method:"POST",

credentials:"include"

}
);

location.href=
"personal.html";

};

loadEvents();

loadMessages();

setInterval(
loadMessages,
3000
);
