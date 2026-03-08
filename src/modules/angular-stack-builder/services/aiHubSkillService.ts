import { useSkillStore } from '../../../hooks/useSkillStore';

// Built-in defaults when AI hub skills are not selected or missing
export const BUILT_IN_SKILLS = [
  {
    id: 'builtin-angular-best-practices',
    name: 'Angular Best Practices',
    description: 'General architectural and coding guidelines for modern Angular apps.',
    content: `# Angular Development Best Practices

1. **Standalone Components**: Prefer standalone components over NgModules.
2. **OnPush Change Detection**: Use \`ChangeDetectionStrategy.OnPush\` by default for all presentational components.
3. **Signals**: Use Signals for fine-grained reactivity where possible.
4. **RxJS**: Avoid unnecessary subscriptions. Use the \`async\` pipe in templates.
5. **Core & Shared**: Keep single-use layout components in \`core/\` and reusable UI components in \`shared/\`.
`,
  },
  {
    id: 'builtin-angular-code-review',
    name: 'Angular Code Review Checklist',
    description: 'Checklist for reviewing Angular pull requests.',
    content: `# Angular Code Review Checklist

- [ ] Does the component use OnPush change detection?
- [ ] Are any subscriptions manually unsubscribed or managed using takeUntilDestroyed?
- [ ] Is state derived using computed signals or RxJS derived streams?
- [ ] Are inputs strongly typed and outputs emitting custom events?
- [ ] Are there test cases covering edge cases?
`,
  },
  {
    id: 'builtin-angular-performance',
    name: 'Angular Performance Guidelines',
    description: 'Tips and tricks to ensure high frame rates and quick load times.',
    content: `# Angular Performance Guidelines

- Use trackBy functions in *ngFor loops (or \`for\` block track in new control flow).
- Lazy load routing modules/components.
- Defer loading of non-critical UI components via \`@defer\`.
- Use \`ImageOptimization\` directives for fast image loading.
`,
  },
  {
    id: 'builtin-angular-testing',
    name: 'Angular Testing Practices',
    description: 'Standard practices for Unit and E2E testing in Angular',
    content: `# Angular Testing Practices

- Test components using shallow rendering or standalone component testing tools.
- Mock external services to isolate component logic.
- E2E tests should focus on critical user journeys (Playwright or Cypress recommended).
`,
  }
];

export function useAIHubSkills() {
  const { skills } = useSkillStore();
  
  // Filter only applicable skills if desired, or return all
  return skills;
}
