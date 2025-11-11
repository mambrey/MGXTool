# Contact Hierarchy Modification - Reporting Structure with Influencer Element

## Overview
Transform the contact hierarchy to focus on "who reports to who" relationships with an influencer indicator.

## Changes Required

### 1. Update Contact Type Definition (src/types/crm.ts)
- [x] Add `isInfluencer` boolean field to Contact interface
- [x] Keep existing `managerId` field for reporting relationships
- [x] Maintain compatibility with existing data structure

### 2. Update ContactForm.tsx
- [ ] Add "Influencer" checkbox/toggle field
- [ ] Ensure Manager dropdown is properly connected
- [ ] Update form submission to include isInfluencer field
- [ ] Add visual indicator for influencer status

### 3. Update ContactHierarchy.tsx
- [ ] Rebuild hierarchy based on managerId (reporting relationships)
- [ ] Add influencer badge/indicator to contacts marked as influencers
- [ ] Show clear reporting lines (manager → direct reports)
- [ ] Update visualization to emphasize reporting structure
- [ ] Keep influence level as additional context

### 4. Update DataView.tsx (if needed)
- [ ] Add isInfluencer column option
- [ ] Update filters to include influencer status

## Implementation Details

### Reporting Structure Logic
- Use `managerId` field to build manager-subordinate tree
- Root nodes: contacts without a manager (top-level executives)
- Child nodes: contacts who report to a manager
- Display as expandable tree showing reporting lines

### Influencer Element
- Boolean flag `isInfluencer` on Contact
- Visual indicator: star icon, special badge, or highlight
- Influencers can be at any level of the reporting hierarchy
- Separate from "influence level" (Decision Maker, Influencer, User, Gatekeeper)

## Files to Modify
1. src/types/crm.ts - Add isInfluencer field
2. src/components/ContactForm.tsx - Add influencer toggle
3. src/components/ContactHierarchy.tsx - Rebuild hierarchy logic
4. src/components/DataView.tsx - Add influencer column/filter