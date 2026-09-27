const { useState } = React;

const eventIdeas = [
    {
        number: "01",
        title: "CODE CLASH",
        category: "THE SPEED RUN",
        description: "A fast-paced algorithm showdown where sharp thinking beats the clock.",
        theme: "red",
        hero: "TONY STARK",
        skills: ["Algorithms", "Speed", "Problem solving"]
    },
    {
        number: "02",
        title: "BUILD THE MULTIVERSE",
        category: "THE TEAM-UP",
        description: "Bring a team, pick a real-world problem, and build a working idea together.",
        theme: "blue",
        hero: "PETER PARKER",
        skills: ["Teamwork", "Prototyping", "Creative thinking"]
    },
    {
        number: "03",
        title: "AI FROM ZERO",
        category: "THE WORKSHOP",
        description: "Explore AI and machine learning through a practical, beginner-friendly session.",
        theme: "purple",
        hero: "DOCTOR STRANGE",
        skills: ["AI basics", "Machine learning", "Python"]
    },
    {
        number: "04",
        title: "INFINITY QUIZ",
        category: "THE KNOWLEDGE TEST",
        description: "A team quiz across coding, computer science, and the wider tech universe.",
        theme: "gold",
        hero: "THOR",
        skills: ["Computer science", "Quick thinking", "Team play"]
    },
    {
        number: "05",
        title: "CAREER POWER-UP",
        category: "THE NEXT LEVEL",
        description: "Get practical guidance on DSA, interviews, projects, and your next tech step.",
        theme: "ice",
        hero: "DOCTOR STRANGE",
        skills: ["DSA", "Interview prep", "Career planning"]
    }
];

function EventCard({ event, duplicate = false }) {
    return (
        <article className={`event-card event-${event.theme}`} tabIndex={duplicate ? -1 : 0}>
            <div className="event-art" role="img" aria-label={`${event.title} artwork placeholder`}>
                <span className="art-index">{event.number}</span>
                <span className="art-ring art-ring-one"></span>
                <span className="art-ring art-ring-two"></span>
                <span className="art-crosshair">✳</span>
                <span className="art-label">ALGORITHMS ASSEMBLE / 2026</span>
                <span className="art-bottom-glow"></span>
            </div>
            <div className="event-card-copy">
                <p className="event-category">{event.category}</p>
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <span className="coming-badge"><span></span> COMING SOON</span>
            </div>
        </article>
    );
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // Fall back to the legacy copy command if the clipboard API is blocked.
        }
    }

    const temporaryField = document.createElement("textarea");
    temporaryField.value = text;
    temporaryField.setAttribute("readonly", "");
    temporaryField.style.position = "fixed";
    temporaryField.style.opacity = "0";
    document.body.appendChild(temporaryField);
    temporaryField.select();
    const copied = document.execCommand("copy");
    temporaryField.remove();
    if (!copied) throw new Error("Copy unavailable");
}

function makePassText(event, name) {
    return [
        "ALGORITHMS ASSEMBLE · MISSION PASS",
        `Name: ${name || "To be named"}`,
        `Mission: ${event.title}`,
        `Hero: ${event.hero}`,
        `Skills: ${event.skills.join(", ")}`,
        "Dates and registration details: coming soon"
    ].join("\n");
}

function downloadMissionPass(event, name) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const context = canvas.getContext("2d");
    const background = context.createLinearGradient(0, 0, 1200, 675);
    background.addColorStop(0, "#100d18");
    background.addColorStop(0.58, "#211332");
    background.addColorStop(1, "#09090c");
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(205, 166, 245, .45)";
    context.lineWidth = 2;
    context.strokeRect(32, 32, 1136, 611);
    context.fillStyle = "#c9a4ec";
    context.font = "500 20px monospace";
    context.fillText("GEEKSFORGEEKS × BENNETT  /  ALGORITHMS ASSEMBLE", 70, 88);
    context.fillStyle = "rgba(255,255,255,.56)";
    context.font = "500 18px monospace";
    context.fillText("MISSION PASS  /  2026", 70, 158);
    context.fillStyle = "#ffffff";
    context.font = "800 58px Arial";
    context.fillText((name || "YOUR NAME").trim().toUpperCase().slice(0, 24), 70, 246);
    context.fillStyle = "#c9a4ec";
    context.font = "600 22px monospace";
    context.fillText(`HERO  /  ${event.hero}`, 70, 316);
    context.fillStyle = "#ffffff";
    context.font = "800 52px Arial";
    context.fillText(event.title, 70, 402);
    context.fillStyle = "rgba(255,255,255,.7)";
    context.font = "500 21px Arial";
    context.fillText(event.skills.join("   ·   "), 70, 462);
    context.fillStyle = "#b5a2c8";
    context.font = "500 17px monospace";
    context.fillText("DATES & REGISTRATION DETAILS  /  COMING SOON", 70, 584);

    canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const download = document.createElement("a");
        download.href = url;
        download.download = `mission-pass-${event.number}.png`;
        download.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
}

function UpcomingEvents() {
    const [selectedEventNumber, setSelectedEventNumber] = useState("01");
    const [passName, setPassName] = useState("");
    const [passNotice, setPassNotice] = useState("");
    const selectedEvent = eventIdeas.find((event) => event.number === selectedEventNumber) || eventIdeas[0];

    async function shareSquadInvite() {
        const pageUrl = `${window.location.href.split("#")[0]}#mission-pass`;
        const invite = `Join my ${selectedEvent.title} mission at Algorithms Assemble! Dates and registration details are coming soon.`;
        try {
            if (navigator.share) {
                await navigator.share({ title: "Join my mission", text: invite, url: pageUrl });
                setPassNotice("Squad invite shared.");
            } else {
                await copyText(`${invite}\n${pageUrl}`);
                setPassNotice("Squad invite copied. Send it to your team.");
            }
        } catch (error) {
            if (error.name !== "AbortError") setPassNotice("Could not share just now. Try copying the pass instead.");
        }
    }

    async function copyPass() {
        try {
            await copyText(makePassText(selectedEvent, passName.trim()));
            setPassNotice("Mission pass copied to your clipboard.");
        } catch {
            setPassNotice("Copy is unavailable in this browser.");
        }
    }

    return (
        <div className="events-page min-h-screen overflow-hidden bg-void text-white">
            <header className="events-nav flex items-center justify-between px-6 md:px-12">
                <a href="#main-content" className="skip-link">SKIP TO CONTENT</a>
                <a href="index.html" className="events-brand" aria-label="Algorithms Assemble home">
                    <span>GFG</span> × BENNETT
                </a>
                <nav className="flex items-center gap-4 md:gap-8" aria-label="Main navigation">
                    <a href="index.html">HOME</a>
                    <a href="index.html#missions">MISSIONS</a>
                    <a className="nav-active" href="events.html" aria-current="page">EVENTS</a>
                    <a href="index.html#register">REGISTER</a>
                </nav>
            </header>

            <main id="main-content" tabIndex="-1">
                <section className="events-hero px-6 md:px-12">
                    <div className="hero-grid-mark" aria-hidden="true"></div>
                    <div className="hero-kicker"><span></span> EVENT TRANSMISSION / 2026</div>
                    <p className="hero-overline">THE NEXT CHAPTER STARTS HERE</p>
                    <h1 className="font-display">UPCOMING<br /><span>EVENTS.</span></h1>
                    <div className="hero-bottom flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <p className="hero-description">New challenges. New skills. New heroes.<br />The next missions are taking shape.</p>
                        <div className="hero-actions">
                            <a href="#event-radar" className="hero-scroll">EXPLORE WHAT'S NEXT <span>↓</span></a>
                            <a href="#mission-pass" className="hero-scroll hero-scroll-strong">BUILD YOUR MISSION PASS <span>↘</span></a>
                            <a href="#schedule" className="hero-scroll">VIEW THE DRAFT EVENT FLOW <span>↓</span></a>
                        </div>
                    </div>
                    <div className="hero-side-note" aria-hidden="true">STAY READY<br />STAY CURIOUS</div>
                </section>

                <section className="event-radar" id="event-radar">
                    <div className="radar-heading flex flex-col gap-5 px-6 md:flex-row md:items-end md:justify-between md:px-12">
                        <div>
                            <p className="section-kicker">01 / ON THE RADAR</p>
                            <h2>YOUR NEXT<br /><span>MISSION.</span></h2>
                        </div>
                        <p className="radar-note">Swipe or scroll to scan the event lineup.<br />Hover over any card to pause the feed.</p>
                    </div>

                    <div className="marquee-viewport" aria-label="Upcoming event ideas">
                        <div className="marquee-track">
                            {[0, 1].map((copy) => (
                                <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
                                    {eventIdeas.map((event) => <EventCard key={`${copy}-${event.number}`} event={event} duplicate={copy === 1} />)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="marquee-footer flex items-center justify-between px-6 md:px-12">
                        <span>EVENT CONCEPTS / 05</span>
                        <span>DATES & REGISTRATION DETAILS COMING SOON</span>
                    </div>
                </section>

                <section className="mission-pass-section px-6 py-24 md:px-12 md:py-32" id="mission-pass">
                    <div className="pass-heading">
                        <p className="section-kicker">02 / YOUR HERO ID</p>
                        <h2>CHOOSE YOUR HERO.<br /><span>CLAIM YOUR MISSION.</span></h2>
                        <p>Build a preview pass, save it, or send your squad an invite. Your name stays on this page and is not submitted anywhere.</p>
                    </div>

                    <div className="pass-layout">
                        <div className="pass-controls">
                            <label htmlFor="pass-name">NAME ON YOUR PASS <span>OPTIONAL</span></label>
                            <input id="pass-name" type="text" maxLength="24" autoComplete="off" placeholder="Type your name" value={passName} onChange={(event) => setPassName(event.target.value)} />

                            <p className="pass-field-label" id="pass-choice-label">CHOOSE A MISSION</p>
                            <div className="pass-choices" role="group" aria-labelledby="pass-choice-label">
                                {eventIdeas.map((event) => (
                                    <button key={event.number} className={`pass-choice ${selectedEventNumber === event.number ? "is-selected" : ""}`} type="button" aria-pressed={selectedEventNumber === event.number} onClick={() => { setSelectedEventNumber(event.number); setPassNotice(""); }}>
                                        <span>{event.number}</span>{event.title}
                                    </button>
                                ))}
                            </div>

                            <div className="pass-actions">
                                <button className="pass-primary-action" type="button" onClick={() => downloadMissionPass(selectedEvent, passName)}>DOWNLOAD PASS <span>↓</span></button>
                                <button className="pass-secondary-action" type="button" onClick={copyPass}>COPY PASS</button>
                                <button className="pass-secondary-action" type="button" onClick={shareSquadInvite}>INVITE YOUR SQUAD <span>↗</span></button>
                            </div>
                            <p className="pass-notice" aria-live="polite">{passNotice || "No sign-up yet · official dates are coming soon."}</p>
                        </div>

                        <article className={`pass-preview event-${selectedEvent.theme}`} aria-label="Live mission pass preview">
                            <div className="pass-preview-top"><span>GFG × BENNETT</span><span>ALGORITHMS ASSEMBLE / 2026</span></div>
                            <div className="pass-preview-orbit" aria-hidden="true"><span>{selectedEvent.number}</span></div>
                            <div className="pass-preview-copy">
                            <p className="pass-preview-kicker">MISSION PASS · PREVIEW</p>
                                <p className="pass-preview-hero">HERO / {selectedEvent.hero}</p>
                                <p className="pass-preview-name">{passName.trim() || "YOUR NAME"}</p>
                                <h3>{selectedEvent.title}</h3>
                                <div className="pass-skill-list">{selectedEvent.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                            </div>
                            <div className="pass-preview-footer"><span>DATE / TBA</span><span>REGISTRATION / COMING SOON</span></div>
                        </article>
                    </div>
                </section>

                <section className="schedule-section px-6 py-24 md:px-12 md:py-32" id="schedule">
                    <div className="schedule-heading">
                        <p className="section-kicker">03 / EVENT DAY</p>
                        <h2>THE MISSION<br /><span>SEQUENCE.</span></h2>
                        <p>This is a planning preview, not the confirmed timetable. Exact sessions and times will be posted here after the organizers confirm them.</p>
                    </div>
                    <div className="schedule-list">
                        {[
                            ["01", "ARRIVE & ASSEMBLE", "Check in, meet your squad, and get the event briefing."],
                            ["02", "OPENING BRIEF", "Get the rules, explore the mission choices, and get ready to start."],
                            ["03", "MISSION ROUNDS", "The main event block: challenges, learning, and team builds."],
                            ["04", "FINALE & WRAP", "Share highlights, celebrate the teams, and close the day."]
                        ].map(([number, title, description]) => (
                            <article className="schedule-stop" key={number}>
                                <span className="schedule-stop-number">{number}</span>
                                <div><h3>{title}</h3><p>{description}</p></div>
                                <span className="schedule-time">TIME TBA</span>
                            </article>
                        ))}
                    </div>
                    <p className="schedule-disclaimer">DRAFT FLOW ONLY · NO EVENT TIMES HAVE BEEN CONFIRMED</p>
                </section>

                <section className="events-note px-6 py-24 md:px-12 md:py-32">
                    <p className="section-kicker">04 / STAY IN THE LOOP</p>
                    <h2>THE SIGNAL<br />WILL <span>RETURN.</span></h2>
                    <p>These are early event concepts. The confirmed schedule, dates, and registration details will be shared here once they are ready.</p>
                    <a href="index.html#register" className="events-cta">BACK TO THE MAIN MISSION <span>↗</span></a>
                </section>
            </main>

            <footer className="events-footer flex flex-col gap-3 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-12">
                <span>GEEKSFORGEEKS × BENNETT UNIVERSITY</span>
                <span>ALGORITHMS ASSEMBLE · 2026</span>
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("events-root")).render(<UpcomingEvents />);
