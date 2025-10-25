# Field-Based Updates Implementation Plan für tsdav

## 📋 Übersicht

Implementierung von feldbasierten Updates für CalDAV (VEVENT), CardDAV (vCard) und VTODO mit ical.js, unter Einhaltung der tsdav-Philosophie.

**Strategie:** Foundation-First Parallelization
- Shared Code wird ZUERST komplett implementiert
- DANN parallele Entwicklung der drei Format-Handler
- Verhindert Race Conditions und Code-Duplikation

**RFC Standards:**
- RFC 5545 (iCalendar) - ✅ ical.js full support
- RFC 6350 (vCard) - ✅ ical.js full support
- RFC 7265 (jCal) - ✅ ical.js full support
- RFC 7986 (iCal Extensions) - ⚠️ ical.js partial support (COLOR only)

---

## 🏛️ TSDAV Projekt-Philosophie

**Kernprinzipien (zu beachten):**

1. ✅ **Minimale Dependencies**
   - Aktuell nur 4 Runtime-Dependencies
   - Bundle Size bewusst halten
   - Neue Dependency: ical.js (~105 KB, gerechtfertigt)

2. ✅ **Protocol-First Design**
   - tsdav ist WebDAV/CalDAV/CardDAV **Client**
   - Fokus auf korrekte Protokoll-Implementierung
   - iCal/vCard = opake Payloads im Core

3. ✅ **Separation of Concerns**
   - Optional Features als separate Utilities (src/util/)
   - Keine Breaking Changes an bestehender API
   - Author empfiehlt external libraries (pretty-jcal)

4. ✅ **Cross-Platform Kompatibilität**
   - Browser + Node.js Support
   - CommonJS + ESM Module
   - TypeScript Native

5. ✅ **Testing-Rigor**
   - Integration Tests mit 7+ Cloud-Providern
   - Mock-basierte Tests für CI/CD
   - Network Request Recording

---

## 📅 PHASEN-PLAN

### Phase 1: Foundation (Sequential - Orchestrator)
**Dauer:** 1-2 Tage
**Agent:** PROJECT ORCHESTRATOR (task-orchestrator)

**Ziel:** Shared Code komplett implementieren, bevor parallele Entwicklung startet

#### Tasks:
1. ✅ Plan-Dokument erstellen: `FIELD_UPDATES_IMPLEMENTATION_PLAN.md`
2. ical.js@^2.0.0 zu package.json hinzufügen
3. Bundle Size Impact messen (vor/nach mit bundlephobia)
4. Shared Infrastructure implementieren:
   - `src/types/fieldUpdates.ts` - Type Definitions
   - `src/util/fieldUpdater.ts` - Shared Functions
5. Unit Tests für shared functions
6. Git Branches für parallele Entwicklung erstellen
7. Code als READ-ONLY markieren (für Phase 2)

#### Shared Functions in `src/util/fieldUpdater.ts`:
```typescript
// Line Handling
export function parseLine(line: string): { key: string; value: string; params?: Record<string, string> }
export function foldLine(line: string, maxLength?: number): string
export function unfoldLines(icalString: string): string

// iCal Component Handling
export function parseICalComponent(icalString: string): ICAL.Component
export function serializeICalComponent(component: ICAL.Component): string

// Auto-Update Functions
export function updateSequence(component: ICAL.Component): void
export function updateDtstamp(component: ICAL.Component): void

// Preservation Functions
export function preserveVTimezone(vcalendar: ICAL.Component): ICAL.Component
export function preserveVendorProperties(component: ICAL.Component, original: ICAL.Component): void
```

#### Type Definitions in `src/types/fieldUpdates.ts`:
```typescript
export interface BaseFieldUpdaterConfig {
  autoIncrementSequence?: boolean; // default: true
  autoUpdateDtstamp?: boolean;     // default: true
  preserveUnknownFields?: boolean; // default: true
}

export interface FieldUpdateResult {
  data: string;
  modified: boolean;
  warnings?: string[];
}

export type VCardFields = {
  FN?: string;
  N?: string; // structured: family;given;additional;prefix;suffix
  EMAIL?: string;
  TEL?: string;
  ORG?: string;
  NOTE?: string;
}

export type EventFields = {
  SUMMARY?: string;
  DESCRIPTION?: string;
}

export type TodoFields = {
  SUMMARY?: string;
  DESCRIPTION?: string;
}
```

#### Deliverables:
- ✅ `FIELD_UPDATES_IMPLEMENTATION_PLAN.md`
- ✅ package.json updated (ical.js added)
- ✅ `src/types/fieldUpdates.ts` (FROZEN for Phase 2)
- ✅ `src/util/fieldUpdater.ts` (FROZEN for Phase 2)
- ✅ `src/__tests__/unit/fieldUpdater.test.ts`

---

### Phase 2: Parallel Implementation (3 Developer Agents)
**Dauer:** 2-3 Tage
**Agents:** VCARD-DEV, VEVENT-DEV, VTODO-DEV (parallel spawned)

**Constraint:** ⚠️ Agents dürfen NUR LESEN aus fieldUpdater.ts und fieldUpdates.ts

#### Agent 1: VCARD-DEV (coder)
**Branch:** `feature/vcard-updater`

**Tasks:**
- Implementiert `src/util/vCardFieldUpdater.ts`
- Felder: FN, N, EMAIL, TEL, ORG, NOTE
- Importiert shared functions (READ-ONLY)
- Handling für strukturierte Felder (N)
- Line-Folding für lange Werte
- Unit Tests: `src/__tests__/unit/vCardFieldUpdater.test.ts`

**API:**
```typescript
export function updateVCardFields(
  vCard: DAVVCard,
  fields: VCardFields,
  config?: BaseFieldUpdaterConfig
): FieldUpdateResult
```

**Deliverables:**
- ✅ `src/util/vCardFieldUpdater.ts` (250-300 LOC)
- ✅ Unit Tests (Coverage > 80%)
- ✅ Edge Cases: Line Folding, UTF-8, Structured N field

---

#### Agent 2: VEVENT-DEV (coder)
**Branch:** `feature/vevent-updater`

**Tasks:**
- Implementiert `src/util/calendarFieldUpdater.ts`
- Felder: SUMMARY, DESCRIPTION
- Nutzt `updateSequence()`, `updateDtstamp()` (READ-ONLY)
- VCALENDAR Wrapper Preservation
- VTIMEZONE Preservation
- UID Immutability Check
- Unit Tests: `src/__tests__/unit/calendarFieldUpdater.test.ts`

**API:**
```typescript
export function updateEventFields(
  calendarObject: DAVCalendarObject,
  fields: EventFields,
  config?: BaseFieldUpdaterConfig
): FieldUpdateResult
```

**Deliverables:**
- ✅ `src/util/calendarFieldUpdater.ts` (300-350 LOC)
- ✅ Unit Tests (Coverage > 80%)
- ✅ Edge Cases: SEQUENCE increment, DTSTAMP update, VTIMEZONE preservation

---

#### Agent 3: VTODO-DEV (coder)
**Branch:** `feature/vtodo-updater`

**Tasks:**
- Implementiert `src/util/todoFieldUpdater.ts`
- Felder: SUMMARY, DESCRIPTION
- Nutzt shared functions (READ-ONLY)
- VCALENDAR Wrapper Preservation
- SEQUENCE/DTSTAMP handling
- Unit Tests: `src/__tests__/unit/todoFieldUpdater.test.ts`

**API:**
```typescript
export function updateTodoFields(
  calendarObject: DAVCalendarObject,
  fields: TodoFields,
  config?: BaseFieldUpdaterConfig
): FieldUpdateResult
```

**Deliverables:**
- ✅ `src/util/todoFieldUpdater.ts` (280-320 LOC)
- ✅ Unit Tests (Coverage > 80%)
- ✅ Edge Cases: Nested VCALENDAR, SEQUENCE handling

---

### Phase 3: Integration & Real Server Tests
**Dauer:** 2-3 Tage
**Agent:** ORCHESTRATOR + Developer Agents

**Ziel:** Branches mergen, Integration Tests mit echten CalDAV-Servern

#### Tasks:
1. **Branch Merging** (sequential: vCard → vEvent → vTodo)
   - Conflict Resolution
   - API Consistency Check

2. **Integration Tests** - In bestehende Test-Files:
   - `src/__tests__/integration/baikal/calendar.test.ts`
   - `src/__tests__/integration/baikal/addressBook.test.ts`
   - `src/__tests__/integration/radicale/todo.test.ts`
   - `src/__tests__/integration/nextcloud/calendar.test.ts`
   - `src/__tests__/integration/nextcloud/addressBook.test.ts`

#### Test-Szenarien (pro Server):

**CalDAV (VEVENT):**
```typescript
test('updateEventFields should update SUMMARY and auto-increment SEQUENCE', async () => {
  // 1. Create event
  // 2. Update via updateEventFields({ SUMMARY: 'New Title' })
  // 3. Verify SUMMARY changed
  // 4. Verify SEQUENCE incremented
  // 5. Verify DTSTAMP updated
  // 6. Cleanup
});

test('updateEventFields should preserve VTIMEZONE', async () => { ... });
test('updateEventFields should preserve vendor extensions (X-*)', async () => { ... });
test('updateEventFields should handle concurrent updates (etag conflict)', async () => { ... });
test('updateEventFields should fold long lines (>75 chars)', async () => { ... });
```

**CardDAV (vCard):**
```typescript
test('updateVCardFields should update FN and EMAIL', async () => { ... });
test('updateVCardFields should handle structured N field', async () => { ... });
test('updateVCardFields should handle UTF-8 characters', async () => { ... });
```

**CalDAV (VTODO):**
```typescript
test('updateTodoFields should update SUMMARY', async () => { ... });
test('updateTodoFields should preserve VCALENDAR wrapper', async () => { ... });
```

#### Test Execution (mit .env Credentials):
```bash
# Baikal
MOCK_FETCH=false npm run test:baikal

# Nextcloud
MOCK_FETCH=false npm run test:nextcloud

# Radicale
npm test -- --testPathPattern=radicale
```

#### Deliverables:
- ✅ Alle Branches gemerged
- ✅ Integration Tests in bestehenden Files
- ✅ Test Coverage Report
- ✅ Tests mit Baikal, Radicale, Nextcloud bestehen

---

### Phase 4: Philosophy Review & QA
**Dauer:** 1 Tag
**Agent:** PHILOSOPHY REVIEWER (reviewer)

**Ziel:** Sicherstellen dass tsdav-Philosophie eingehalten wurde

#### Review Checkliste:

**✅ Dependency Policy:**
- [ ] ical.js korrekt deklariert in package.json
- [ ] Keine zusätzlichen Dependencies
- [ ] Bundle Size Impact < 50KB (gemessen)

**✅ Architecture Compliance:**
- [ ] Utilities in `src/util/`, nicht im Core
- [ ] Keine Breaking Changes an bestehender API
- [ ] Optional Features (kein Force)
- [ ] Existing functions unmodified

**✅ Code Quality:**
- [ ] TypeScript strict mode compliant
- [ ] Alle Exports typisiert
- [ ] ESLint Regeln eingehalten
- [ ] Konsistenter Code Style

**✅ Testing Standards:**
- [ ] Unit Test Coverage > 80%
- [ ] Edge Cases getestet
- [ ] Integration Tests mit 3 Servern
- [ ] Keine Regression in bestehenden Tests

**✅ API Consistency:**
- [ ] Alle drei Updater haben ähnliche Signaturen
- [ ] Error Handling konsistent
- [ ] Return Types konsistent (FieldUpdateResult)

**Bundle Size Messung:**
```bash
# Before
npm run build
ls -lh dist/tsdav.esm.js

# After (with ical.js)
npm run build
ls -lh dist/tsdav.esm.js

# Difference should be < 50KB minified
```

#### Deliverables:
- ✅ Code Review Report
- ✅ Bundle Size Analyse (vor/nach)
- ✅ Philosophy Compliance Checklist
- ✅ Go/No-Go Entscheidung

---

### Phase 5: Documentation & Release
**Dauer:** 1 Tag
**Agent:** ORCHESTRATOR (task-orchestrator)

**Ziel:** Dokumentation, Examples, Release vorbereiten

#### Tasks:
1. **CHANGELOG.md** updaten (v2.2.0)
   ```markdown
   ## [2.2.0] - 2025-XX-XX

   ### Added
   - Field-based update utilities for CalDAV, CardDAV, VTODO
   - `updateEventFields()` - Update calendar events by field
   - `updateVCardFields()` - Update vCards by field
   - `updateTodoFields()` - Update todos by field
   - Auto-increment SEQUENCE and update DTSTAMP
   - Preserve VTIMEZONE and vendor extensions

   ### Dependencies
   - Added ical.js@^2.0.0 for RFC-compliant iCal/vCard parsing
   ```

2. **Docusaurus Docs** updaten:
   - New page: `docs/docs/utilities/field-updaters.md`
   - Document all three functions
   - Usage examples
   - Comparison: Old vs New Approach

3. **README.md** Examples:
   ```typescript
   // OLD way - manual iCal string generation
   const iCalString = "BEGIN:VCALENDAR\nVERSION:2.0\n..."; // 500+ lines
   await client.updateCalendarObject({ calendarObject: { data: iCalString } });

   // NEW way - field-based update
   import { updateEventFields } from 'tsdav';
   const updatedData = updateEventFields(event, {
     SUMMARY: 'Updated Title',
     DESCRIPTION: 'New description'
   });
   await client.updateCalendarObject({ calendarObject: { ...event, data: updatedData.data } });
   ```

4. **Export neue Functions** aus src/index.ts:
   ```typescript
   export { updateEventFields } from './util/calendarFieldUpdater';
   export { updateVCardFields } from './util/vCardFieldUpdater';
   export { updateTodoFields } from './util/todoFieldUpdater';
   export type { EventFields, VCardFields, TodoFields, FieldUpdateResult } from './types/fieldUpdates';
   ```

5. **Version Bump:** 2.2.0 (Minor - neue Features, keine Breaking Changes)

#### Deliverables:
- ✅ CHANGELOG.md
- ✅ Docusaurus Documentation
- ✅ README.md Examples
- ✅ src/index.ts exports
- ✅ package.json version: 2.2.0
- ✅ Release bereit

---

## 📊 Zeitplan

| Phase | Dauer | Parallelisierung | Agent(s) |
|-------|-------|------------------|----------|
| **Phase 1** | 1-2 Tage | ❌ Sequential | Orchestrator |
| **Phase 2** | 2-3 Tage | ✅ 3 Agents parallel | VCARD, VEVENT, VTODO |
| **Phase 3** | 2-3 Tage | ✅ Teilweise | Orchestrator + All |
| **Phase 4** | 1 Tag | ❌ Sequential | Reviewer |
| **Phase 5** | 1 Tag | ❌ Sequential | Orchestrator |

**Gesamt:** 7-10 Arbeitstage

---

## 🔒 File Ownership Matrix

Verhindert Race Conditions durch klare Zuständigkeiten:

| Datei | Phase 1 | Phase 2 | Phase 3+ |
|-------|---------|---------|----------|
| `fieldUpdater.ts` | Orchestrator ✍️ | READ-ONLY 👁️ | Orchestrator ✍️ |
| `fieldUpdates.ts` | Orchestrator ✍️ | READ-ONLY 👁️ | Orchestrator ✍️ |
| `vCardFieldUpdater.ts` | - | VCARD-DEV ✍️ | All READ 👁️ |
| `calendarFieldUpdater.ts` | - | VEVENT-DEV ✍️ | All READ 👁️ |
| `todoFieldUpdater.ts` | - | VTODO-DEV ✍️ | All READ 👁️ |
| Integration Tests | - | - | All Agents ✍️ |

**Regel:** Ein File = Ein Owner pro Phase

---

## 🎯 Erfolgskriterien

### Must-Have (Blocker für Release):
- [ ] Alle 3 Field Updater implementiert und getestet
- [ ] Unit Test Coverage > 80%
- [ ] Integration Tests: Baikal, Radicale, Nextcloud passing
- [ ] Bundle Size < +50KB
- [ ] Keine Breaking Changes an bestehender API
- [ ] Philosophy Reviewer Approval
- [ ] Alle bestehenden Tests weiterhin passing
- [ ] TypeScript Compilation without errors
- [ ] ESLint passing

### Nice-to-Have (Future Work):
- [ ] Performance Benchmarks
- [ ] Apple iCloud/Google Tests (wenn Credentials verfügbar)
- [ ] Migration Guide für User
- [ ] DateTime Field Support (DTSTART, DTEND, DUE)
- [ ] RRULE Support (Recurrence Rules)
- [ ] RFC 7986 Extension Support (COLOR, CONFERENCE)

---

## 🚀 Nächste Schritte

1. ✅ Plan-Dokument geschrieben
2. ▶️ Phase 1 starten: Foundation implementieren
   - ical.js dependency hinzufügen
   - Shared Types & Functions erstellen
   - Unit Tests für shared code
3. Phase 2: 3 Developer Agents parallel spawnen
4. Phase 3: Integration & Testing
5. Phase 4: Review
6. Phase 5: Release

---

## 📚 Referenzen

**RFC Standards:**
- [RFC 5545 - iCalendar](https://datatracker.ietf.org/doc/html/rfc5545)
- [RFC 6350 - vCard](https://datatracker.ietf.org/doc/html/rfc6350)
- [RFC 7265 - jCal (JSON)](https://datatracker.ietf.org/doc/html/rfc7265)
- [RFC 7986 - iCalendar Extensions](https://datatracker.ietf.org/doc/html/rfc7986)

**Libraries:**
- [ical.js - Mozilla](https://github.com/kewisch/ical.js)
- [tsdav Repository](https://github.com/natelindev/tsdav)
- [pretty-jcal (Author's project)](https://github.com/natelindev/pretty-jcal)

**Testing:**
- Baikal Server: https://sabre.io/baikal/
- Radicale Server: https://radicale.org/
- Nextcloud: https://nextcloud.com/

---

_Plan erstellt: 2025-01-XX_
_Status: Phase 1 - Foundation in Progress_
