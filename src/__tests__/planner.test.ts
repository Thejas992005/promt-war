import { describe, it, expect } from 'vitest';
import { generateHeuristicPlan, refineEventPlanWithAi } from '../services/geminiService';

describe('Event Planning Engine & Conversational Refinement', () => {
  it('generates a complete birthday plan from natural language', () => {
    const prompt = 'I want to organize a birthday party for 30 guests with a budget of ₹20,000. I prefer an outdoor venue, simple decorations, vegetarian food, and a photography service.';
    const plan = generateHeuristicPlan(prompt, 'INR');

    expect(plan.type).toBe('birthday');
    expect(plan.guestCount).toBe(30);
    expect(plan.totalBudget).toBe(20000);
    expect(plan.preferences.outdoorIndoor).toBe('outdoor');
    expect(plan.budgetItems.length).toBeGreaterThanOrEqual(6);
    expect(plan.timeline.length).toBeGreaterThanOrEqual(4);
    expect(plan.dayOfSchedule.length).toBeGreaterThanOrEqual(4);
    expect(plan.vendors.length).toBeGreaterThanOrEqual(3);
    expect(plan.personalizedIdeas.colorPalette.length).toBeGreaterThanOrEqual(3);

    // Sum of budget items must match or closely match totalBudget
    const sum = plan.budgetItems.reduce((acc, item) => acc + item.estimatedCost, 0);
    expect(sum).toBe(20000);
  });

  it('generates a destination wedding plan with Lakhs budget', () => {
    const prompt = 'Royal destination wedding in Udaipur for 250 guests with a budget of 15 Lakhs.';
    const plan = generateHeuristicPlan(prompt, 'INR');

    expect(plan.type).toBe('wedding');
    expect(plan.guestCount).toBe(250);
    expect(plan.totalBudget).toBe(1500000);
    const sum = plan.budgetItems.reduce((acc, item) => acc + item.estimatedCost, 0);
    expect(sum).toBe(1500000);
  });

  it('refines plan interactively with vegan dietary requirement', async () => {
    const basePlan = generateHeuristicPlan('Birthday party for 30 people with ₹20,000 budget');
    const refined = await refineEventPlanWithAi(basePlan, 'Make all food 100% plant-based vegan');

    expect(refined.preferences.dietary).toContain('100% Plant-Based Vegan');
    expect(refined.personalizedIdeas.menuSuggestions[0].dietaryNotes).toContain('Vegan');
  });

  it('adds rain contingency when requested by user', async () => {
    const basePlan = generateHeuristicPlan('Outdoor community gathering for 100 people');
    const refined = await refineEventPlanWithAi(basePlan, 'Add rain contingency plan');

    const rainTask = refined.timeline.find(t => t.title.toLowerCase().includes('waterproof') || t.title.toLowerCase().includes('canopy'));
    expect(rainTask).toBeDefined();
  });
});

