<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import checkmarkIcon from '../../assets/icons/checkmark.png';

  interface Skill {
    name: string;
    level: 'experienced' | 'intermediate' | 'basic';
  }

  const frontendSkills: Skill[] = [
    { name: 'HTML CSS JS', level: 'experienced' },
    { name: 'svelte', level: 'experienced' },
    { name: 'React', level: 'experienced' },
    { name: 'Flutter', level: 'intermediate' },
    { name: 'Flet', level: 'experienced' }
  ];

  const backendSkills: Skill[] = [
    { name: 'FastApi', level: 'experienced' },
    { name: 'Go and Wails', level: 'intermediate' },
    { name: 'Node JS', level: 'experienced' },
    { name: 'Pocket Base', level: 'experienced' }
  ];

  function getSkillLevel(level: Skill['level']): string {
    return t($language, level);
  }

  function getLevelColor(level: Skill['level']): string {
    switch (level) {
      case 'experienced':
        return 'var(--text)';
      case 'intermediate':
        return 'var(--text)';
      case 'basic':
        return 'var(--text)';
      default:
        return 'var(--text)';
    }
  }
</script>

<div class="skills-container">
  <div class="skill-category">
    <div class="category-header">
      <h2>{t($language, 'frontendDev')}</h2>
    </div>
    <div class="skills-grid">
      {#each frontendSkills as skill}
        <div class="skill-item">
          <div class="skill-check">
            <img src={checkmarkIcon} alt="Checkmark" />
          </div>
          <div class="skill-info">
            <h3>{skill.name}</h3>
            <span class="skill-level" style="color: {getLevelColor(skill.level)}">
              {getSkillLevel(skill.level)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="skill-category">
    <div class="category-header">
      <h2>{t($language, 'backendDev')}</h2>
    </div>
    <div class="skills-grid">
      {#each backendSkills as skill}
        <div class="skill-item">
          <div class="skill-check">
            <img src={checkmarkIcon} alt="Checkmark" />
          </div>
          <div class="skill-info">
            <h3>{skill.name}</h3>
            <span class="skill-level" style="color: {getLevelColor(skill.level)}">
              {getSkillLevel(skill.level)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .skills-container {
    display: flex;
    gap: 0.8rem;
    padding: 0.3rem;
    max-width: 700px;
    margin: 0 auto;
    justify-content: center;
    flex-wrap: wrap;
  }

  .skill-category {
    background: var(--bg);
    border: 2px solid var(--text);
    box-shadow: 3px 3px 0 var(--text);
    padding: 1rem;
    flex: 1;
    min-width: 240px;
    max-width: 340px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .skill-category:hover {
    box-shadow: 8px 8px 0 var(--text);
    transform: translateY(-2px);
  }

  .skill-category:active {
    box-shadow: 3px 3px 0 var(--text);
    transform: translateY(0);
  }

  .category-header {
    margin-bottom: 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 2px solid var(--text);
  }

  .category-header h2 {
    font-size: 1rem;
    font-weight: 900;
    color: var(--text);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .skills-grid {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.5rem;
    background: var(--bg);
    border: 2px solid var(--text);
    box-shadow: 2px 2px 0 var(--text);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .skill-item:hover {
    box-shadow: 5px 5px 0 var(--text);
    transform: translateX(-2px);
  }

  .skill-item:active {
    box-shadow: 2px 2px 0 var(--text);
    transform: translateX(0);
  }

  .skill-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--text);
    border: 2px solid var(--text);
    flex-shrink: 0;
  }

  .skill-check img {
    width: 14px;
    height: 14px;
    filter: invert(1);
  }

  :global(.dark-mode) .skill-check {
    background: #fff;
    border: 2px solid var(--text);
  }

  :global(.dark-mode) .skill-check img {
    filter: invert(0);
  }

  .skill-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
  }

  .skill-info h3 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
  }

  .skill-level {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media screen and (max-width: 768px) {
    .skills-container {
      flex-direction: column;
      gap: 1rem;
      padding: 0.25rem;
    }

    .skill-category {
      min-width: auto;
      max-width: 100%;
      padding: 1rem;
      box-shadow: 3px 3px 0 var(--text);
    }

    .skill-category:hover {
      box-shadow: 4px 4px 0 var(--text);
    }

    .category-header h2 {
      font-size: 1.1rem;
    }

    .skill-item {
      padding: 0.5rem;
      box-shadow: 2px 2px 0 var(--text);
    }

    .skill-info h3 {
      font-size: 0.9rem;
    }

    .skill-level {
      font-size: 0.75rem;
    }
  }
</style>
