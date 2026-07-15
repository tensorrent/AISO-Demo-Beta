# The AISO Owner's Manual
### A Plain-Language Guide for the Curious — no prior knowledge assumed

_Companion to the [Technical Manual](TECHNICAL_MANUAL.md). Where that book is the wiring
diagram, this one is the friendly voice that tells you what the machine is, what it does, and
what happens inside it when you use it. You do not need to be an engineer to read this. You do
not need to know what any of the words mean yet — we will introduce them one at a time, the way
you would introduce a person._

---

## Please read me first

Imagine you have just carried home a large wooden box. Inside is a machine. Nobody has ever
owned one before, so there is no friend to ask and no habit to fall back on. This manual is
written for that moment — the moment before you know anything.

We will go slowly. We will use plain words. When we must name a part by its real name (the name
the engineers use), we will say so, and then we will go back to plain words. You can read the
whole thing in one sitting, or you can skip to **Chapter 5**, where we switch the machine on and
watch it answer a question, step by step.

---

## Chapter 1 · What is this machine?

Most machines you have met give you an **answer**. You ask a calculator "what is 8 times 7," and
it says "56," and you believe it because calculators do not lie about arithmetic.

This machine is different. It does not sell you answers. **It computes trust.**

That sounds strange, so here is the everyday version. Suppose you ask a very careful clerk a
question. A dishonest clerk gives you a confident answer whether or not they know. A careful,
honest clerk does something better: they lay out on the counter exactly what they checked, which
rules applied, which facts were solid, which were shaky, and which they had to throw out — and
*then* they tell you how much you should trust the result. If they are not sure, they say "I
am not sure," and they show you why.

**AISO is that honest clerk, built out of software.** Its job is not to sound confident. Its job
is to show its work while it works, so that its answer can be checked, replayed, and argued
with. The thing it hands you is not "the answer" — it is **how much the answer can be trusted,
and the visible reasons why.**

The engineers have a one-sentence version of this, and every word is load-bearing:

> **AISO is a universal trust engine with transparent, auditable constraints.**

- **Trust engine** — the thing it produces is *trust*, not just a reply.
- **Transparent** — you can watch it decide, live, not read an excuse afterward. A glass box,
  not a black box.
- **Auditable** — you can rewind the tape and verify every step.
- **Constraints** — it reaches its verdict by showing which rules are *active*, *struck out*,
  *replaced*, or *disputed*. Trust is simply **what survives the rules.**

---

## Chapter 2 · The idea in one breath

Here is the whole machine in a single breath, and then we will spend the rest of the manual
unpacking it:

> You give it information. It **files that information by its meaning** (not by its spelling).
> It **keeps that information safe** by cutting it into pieces and scattering copies. It lets
> **many machines share the same memory** without any of them being in charge. And when you ask
> it to reason, it **shows every step** and tells you honestly how far to trust the result.

Four promises hide in there, and the machine keeps all four:

1. **File by meaning.** Two notes that say the same thing in different words are recognized as
   the same thing.
2. **Never lose it.** A single spilled cup of coffee (a broken hard drive, a lost laptop) cannot
   destroy your information.
3. **No boss.** There is no central server that everyone must trust or ask permission from. The
   machines gossip and agree among themselves.
4. **Never bluff.** When the reasoning is thin, the machine says so, out loud, rather than
   guessing.

---

## Chapter 3 · The parts in the box

Open the box. There are five parts. Think of them as five workers who share one office.

### Part one — The Front Desk _(the engineers call it the MVP: `AISO-UI-for-Ai`)_
This is the part **you** touch. It has a screen (a dashboard), a lock on the door (sign-in), a
filing cabinet with a very good lock (encrypted storage), and a back room where the actual
thinking happens. When you sign in, register, ask a question, or store a note, you are talking to
the Front Desk. Everything else happens behind it.

### Part two — The Librarian _(the storage substrate: `HashCloud-SPE`)_
The Librarian's whole job is memory. When you hand over a note, the Librarian does not shove it
in a drawer by its first letter. The Librarian reads it, understands what it *means*, and files
it by meaning — so an identical thought said twice takes up one slot, not two. The Librarian also
makes sure nothing is ever lost (Chapter 6) and keeps every branch library in agreement without
a head office.

### Part three — The Bookkeeper _(the research core: `aiso`)_
The quiet worker in the corner who checks the hard sums, keeps the ledgers that must never be
forged, and runs the drills that test whether the whole office is behaving. You rarely talk to
the Bookkeeper directly, but the office would not be trustworthy without them. (This is also
where the deep mathematics and the "settlement" rules live — the referee that makes sure, when
two parties agree to something, neither can cheat the other.)

### Part four — The Foundation _(the L2 floor: `rawkit`)_
The floor the building stands on. It is a very fast, very plain way for machines to remember
things as a web of connected facts and to keep those webs in sync in real time. The Librarian
stands on this floor. You never see it, the way you never see a building's foundation.

### Part five — The Telephone _(the P2P transport: `TangTalk`)_
How two offices in different cities talk without a switchboard operator in the middle. It lets
your machine and a friend's machine pass sealed, signed messages to each other over ordinary
public relays, so your shared memory can travel between you.

That is the whole staff: **a Front Desk you talk to, a Librarian who remembers, a Bookkeeper who
verifies, a Foundation they stand on, and a Telephone between offices.**

---

## Chapter 4 · How it all connects

Now let us watch the five workers hand things to each other. Here is the office, drawn simply:

```
     YOU
      │  (you type on the screen)
      ▼
 ┌───────────────────────── THE FRONT DESK ─────────────────────────┐
 │  the lock (sign-in)  →  the back room (the thinking)  →  the        │
 │  filing cabinet (your private, encrypted records)                  │
 └───────────────┬───────────────────────────────┬──────────────────┘
                 │ "please remember this"         │ "please reason about this"
                 ▼                                 │
        ┌──────────────── THE LIBRARIAN ───────────┘
        │  file by meaning  →  cut into safe pieces  →  tell the other
        │  libraries (gossip) until everyone agrees
        │        │
        │        ▼
        │   THE FOUNDATION (fast shared web of facts)
        └────────────────────────────────────────────
                 ▲
                 │  sealed, signed messages travel between offices
            THE TELEPHONE
```

Two things flow through this office: **questions** (which go to the back room to be reasoned
about) and **memories** (which go to the Librarian to be kept). We will follow one of each.

---

## Chapter 5 · Watch it think — a question, from start to finish

Let us switch the machine on and ask it something. Suppose you type into the dashboard:

> _"Compare the trade-offs of different cell-membrane designs."_

Here is everything that happens, narrated. (In brackets is the real name, for the curious. You
may ignore the brackets entirely.)

**Step 1 — Your words arrive at the back room.**
The dashboard hands your sentence to the thinking part of the Front Desk [the *TENT reasoning
server*, reached at `POST /api/query`]. Nothing has been decided yet. Your sentence is just
sitting on the table.

**Step 2 — The machine weighs your words.**
Before it can think, it must turn your words into something it can measure. It gives each word a
kind of *weight and shape* — a little fingerprint made only of whole numbers, so that the same
word always weighs exactly the same, on any machine, forever [the *BRA charge*, computed by the
*Voxel membrane*]. This is the machine "feeling the heft" of what you said.

**Step 3 — It finds which topics your question is pulled toward.**
Picture a landscape with dips in it. Each dip is a topic the machine knows something about — the
engineers call each dip a **well**. Your weighed question is like a marble set down on this
landscape: it rolls toward the nearest, deepest wells [the *routers* — gravitational, TENT, and
dendritic]. For our question, it rolls toward the wells about biology, structure, and
comparison. Now the machine knows *what neighborhood* your question lives in.

**Step 4 — It gathers candidate responses.**
From those wells it pulls together the possible things it could say [the *Boxel dispatcher*],
and lines them up, best-matching first.

**Step 5 — The Council deliberates.**
This is the heart of the machine, and the reason it is trustworthy. A small **Council** looks at
the candidates and votes — but not with a single opinion. It weighs three things at once:
- **Severity** — how strict should we be here?
- **Mercy** — how much benefit of the doubt is fair?
- **Mildness** — how gentle should the final tone be?

Out of that deliberation comes exactly **one of four verdicts**, and only four:

| Verdict | In plain words |
|---|---|
| **PROCEED** | "This is solid. Here is the answer." |
| **CAUTION** | "Here is an answer, but tread carefully." |
| **ABSTAIN** | "I will not guess. The reasoning is too thin to trust." |
| **CHALLENGE** | "Something here is contradictory. I am pushing back." |

**Step 6 — It refuses to bluff.**
Here is the surprising, important part. If your question were vague, or the signal weak, the
Council would return **ABSTAIN** — and that is the machine working *correctly*, not failing.
Most machines would rather bluff than admit doubt. This one is built to say "I don't know" and
show you why. For our cell-membrane question, which is a clear "compare these things" request,
the Council can deliberate properly and return a real verdict with its reasons attached.

**Step 7 — It writes down what it did, so you can check it later.**
Every step above is recorded on an unerasable running list [the *scroll* — an append-only
ledger]. You can rewind and watch the machine make the same decision again, move for move. This
is what "auditable" means: nothing happens off the record.

**Step 8 — If you are signed in, it files the verdict under your name.**
When you have signed in, the verdict is added to *your own* private, tamper-proof history [the
gateway's *hash-chained event log*], so your record of what the machine told you cannot be
secretly altered — not even by the people who run the machine.

And that is a complete thought, from your keystroke to a trustworthy verdict, with a full paper
trail. **You asked; it showed its work; it told you how far to trust the result.**

---

## Chapter 6 · Watch it remember — storing a note

Now the other flow. Suppose you type a note you want kept: _"a recipe worth keeping."_ Watch the
Librarian.

**Step 1 — It files by meaning, not by spelling.**
The Librarian reads your note and turns it into a *meaning-address* — a fingerprint of what the
note means [a *symbolic pointer*, made by the *Symbolic Pointer Engine*]. If you (or anyone) ever
store the very same thought again, it lands on the same address and is not duplicated. Words are
shared like puzzle pieces; a document is just an ordered set of those pieces.

**Step 2 — It cuts the note into safe pieces.**
Here is how nothing is ever lost. The Librarian cuts your note into **16 pieces** in a clever way
where **any 10 of the 16 are enough to rebuild the whole thing** [*Reed-Solomon erasure coding*].
So up to **6 pieces can be destroyed** and your note survives intact.

**Step 3 — It keeps a full set at home, and scatters copies.**
Your own "home" machine keeps *all 16* pieces, so it can rebuild the note even with no internet
at all. Extra copies of the pieces are placed on other friendly machines, so even if your home
machine is lost, the note lives on elsewhere.

**Step 4 — It tells the other libraries, and they all agree.**
Your machine gossips the new note out to the others [a *SyncBundle*, over ordinary web requests
or over the public relays of the Telephone]. Each note carries **your personal seal** [a
*DID signature*] so no one can forge one in your name. The libraries fold the new note into their
own shelves, and — this is the quiet miracle — **they all end up in exactly the same state**, with
no boss telling them how [they *converge* on the same *frontier root*]. Two strangers' browsers
have been shown to arrive, independently, at the identical shared notebook this way.

So: **you kept a note; it was filed by meaning, made unbreakable, and shared into a swarm that
agrees with itself — with no central server anywhere.**

---

## Chapter 7 · Who can see what (kept simple)

A few plain promises about safety, because a machine that remembers must also be trusted to keep
secrets:

- **Your things are yours.** When you sign in, everything you store or ask is walled off to you.
  There is no path in the machine by which one person can reach another person's records. _(The
  engineers call this per-user isolation, and treat any exception as a bug.)_
- **The lock is real.** You prove who you are with a private key that never leaves your device
  [a *Schnorr* signature]; the machine only ever holds a scrambled stand-in for your session, not
  your key.
- **The filing cabinet is encrypted.** Your stored records are locked with strong modern
  encryption [*AES-256*], one key per person. If you ask to be forgotten, the machine destroys
  *your* key — and without the key, your locked records are instantly unreadable forever. That is
  a real erase, not a "we'll get to it."
- **You can add a second lock.** If you like, you can turn on a six-digit code from a phone app
  [*two-factor authentication*], and — importantly — a thief who steals your session still cannot
  remove that second lock without passing it.
- **The messengers are not trusted.** The public relays that carry notes between offices are
  treated as dumb couriers. They can drop or delay a note, but they cannot forge one, because
  every note is sealed with a signature only you can make.

---

## Chapter 8 · How to switch it on

You do not need this chapter to understand the machine. It is here for the day you want to run it.
There are three little engines to start, in order. Each line is one command typed into a terminal.

```
# 1. Start the Librarian (the memory) — it waits on door number 8791
cd ~/dev/HashCloud-SPE && cargo run -p scroll-server

# 2. Start the Front Desk's lock (sign-in) — it waits on door number 8090
cd ~/dev/AISO-UI-for-Ai && cargo run -p aiso-gateway     # (needs a database)

# 3. Start the dashboard you actually look at
npm --prefix visualizer run dev
```

Or, if you would rather start the whole back office with a single command:

```
docker compose up --build       # brings up the database, the lock, and the thinking part together
```

Then open the dashboard in a browser, create an identity (it makes you a private key and offers
to back it up — **keep that backup safe; it is the only key to your things**), and ask it
something.

---

## Chapter 9 · Technical specifications

Every good old manual ends with a page of specifications. Here is ours. You do not need to
understand these to use the machine; they are here for the record and for the curious.

**What it is made of**
| | |
|---|---|
| Languages | Rust (the engines), TypeScript (the thinking part), Svelte (the dashboard) |
| The five parts | Front Desk (`AISO-UI-for-Ai`) · Librarian (`HashCloud-SPE`) · Bookkeeper (`aiso`) · Foundation (`rawkit`) · Telephone (`TangTalk`) |
| Lives on | your own machine, or a private server, or a swarm of both |

**How it keeps memory safe**
| | |
|---|---|
| Filing method | by meaning, not spelling (identical thoughts share one address) |
| Durability | each note → 16 pieces; any 10 rebuild it; survives 6 lost pieces |
| Home copy | your home machine holds all 16 (works with no internet) |
| Agreement | machines gossip and converge — no central server |
| Tamper check | every memory and every reasoning step is on an unerasable list |

**How it keeps you safe**
| | |
|---|---|
| Sign-in | Schnorr key-proof; the machine stores only a scrambled session stand-in |
| Storage lock | AES-256 encryption, one key per person; "forget me" destroys the key |
| Optional 2nd lock | six-digit phone code (TOTP), with theft-resistant removal |
| Being forgotten | a real, immediate, permanent erase (GDPR Article 17) |

**The doors (network ports), for when it is running**
| Part | Door |
|---|---|
| The lock / sign-in | 8090 |
| The thinking part | 8422 |
| The Librarian (memory) | 8791 |
| The database | 5439 |

**How thoroughly it has been tested** (as of 2026-07-12)
| Part | Checks passing |
|---|---|
| Librarian (`HashCloud-SPE`) | 140 |
| Front Desk engines (`AISO-UI-for-Ai`) | 175 |
| Bookkeeper (`aiso`) | 124 |
| The thinking part (front-end gate) | 657 |
| Sign-in & database (live) | 7 + 10 + 4 |
| Two strangers converging on one shared notebook | proven |

**One number the engineers are proud of.** When the Librarian files the very same library of
words on three completely different kinds of computer (three different programming runtimes), all
three produce the *exact same* fingerprint, down to the last digit:
`92184ab9…047400488`. That sameness is the proof that the machine is honest and repeatable — the
same input always gives the same result, everywhere.

---

## Chapter 10 · Words you may meet

A short dictionary, in plain terms, for words that appear when people talk about this machine.

- **Trust engine** — a machine whose product is *how much to trust something*, not just an answer.
- **Well** — a topic the machine knows about, drawn as a dip your question rolls toward.
- **The Council** — the little panel that weighs a question and returns one of four verdicts:
  **PROCEED**, **CAUTION**, **ABSTAIN** (I won't guess), **CHALLENGE** (I push back).
- **Scroll** — an unerasable running list; you can only add to it, never edit the past, so it can
  always be replayed and checked.
- **Symbolic pointer / file by meaning** — an address made from what something *means*, so the
  same thought said twice is recognized as one.
- **Erasure coding (the 16 pieces)** — cutting a note into pieces so that losing several of them
  still lets you rebuild the whole.
- **Converge** — many machines, with no boss, ending up in exactly the same state on their own.
- **DID signature / seal** — a mark only you can make, proving a note is really from you.
- **Schnorr key** — the private key that proves who you are without ever leaving your device.
- **Crypto-erasure** — being forgotten by destroying your one key, which makes your locked records
  instantly and permanently unreadable.
- **Home-first** — your own machine keeps a complete copy, so it works even with no internet.

---

## A closing word

You now know, in plain language, what this machine is: **an honest clerk that files by meaning,
never loses what you give it, answers to no central boss, and refuses to bluff.** You know how
its five workers hand things to one another. You have watched it think through a question and
remember a note. And you have the specifications for the record.

If you want the exact wiring — every command, every door, every rule — turn to the
[Technical Manual](TECHNICAL_MANUAL.md). If you want the shorter "which part do I use, and when,"
turn to the [Capabilities index](CAPABILITIES.md). But you do not need either to begin. You may
simply switch it on and ask it something — and watch it show you its work.

---

_Governed by the Sovereign Integrity Protocol License (SIP License v1.1) — © 2026 Brad Wallace /
TensorRent. Free for personal, family, and educational use; commercial use requires a license.
See [`LICENSE`](../LICENSE)._
