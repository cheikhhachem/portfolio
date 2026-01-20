<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import experienceIcon from '../../assets/icons/experience.png';
  import workIcon from '../../assets/icons/work.png';
  // Calculate the experience years from 2019
  const experienceYears = Math.round((new Date().getTime() - new Date('2019-01-01').getTime()) / (1000 * 60 * 60 * 24 * 365));
</script>


<div class="about-container">
  <div class="card-row">
    <div class="info-card">
      <div class="card-header">
        <img src={experienceIcon} alt="Experience icon" class="icon" />
        <h2>{t($language, 'experienceLabel')}</h2>
      </div>
      <div class="card-stats">
        <span class="stat-number">{experienceYears}+</span>
        <span class="stat-label">{t($language, 'years')}</span>
      </div>
      <p class="card-description">
        {t($language, 'developer')} {t($language, 'experienceLabel')}
      </p>
    </div>

    <div class="info-card">
      <div class="card-header">
        <img src={workIcon} alt="Work icon" class="icon" />
        <h2>{t($language, 'currentRole')}</h2>
      </div>
      <p class="card-role">{t($language, 'clinicDirector')}</p>
    </div>
  </div>

  <div class="description-box">
    <p>{t($language, 'devDesc')}</p>
  </div>

  <div class="description-box">
    <p>{t($language, 'clinicDesc')}</p>
  </div>
</div>

<style>
  .about-container {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 0.3rem;
    max-width: 700px;
    margin: 0 auto;
  }

  .card-row {
    display: flex;
    gap: 0.8rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .info-card {
    background: var(--bg);
    border: 2px solid var(--text);
    box-shadow: 3px 3px 0 var(--text);
    padding: 1rem;
    min-width: 220px;
    flex: 1;
    max-width: 320px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .info-card:hover {
    box-shadow: 8px 8px 0 var(--text);
    transform: translateY(-2px);
  }

  .info-card:active {
    box-shadow: 3px 3px 0 var(--text);
    transform: translateY(0);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .card-header .icon {
    width: 40px;
    height: 40px;
  }

  :global(.dark-mode) .card-header .icon {
    filter: invert(1);
  }

  .card-header h2 {
    font-size: 1.1rem;
    color: var(--text);
    font-weight: 800;
    margin: 0;
  }

  .card-stats {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.8rem 0;
    padding: 0.8rem;
    background: var(--text);
    color: var(--bg);
    border: 2px solid var(--text);
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.95rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .card-description,
  .card-role {
    color: var(--text);
    font-size: 0.95rem;
    line-height: 1.5;
    text-align: center;
    font-weight: 600;
  }

  .card-role {
    font-size: 1rem;
    margin: 1.5rem 0;
  }

  .description-box {
    background: var(--bg);
    border: 2px solid var(--text);
    box-shadow: 2px 2px 0 var(--text);
    padding: 0.8rem;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .description-box:hover {
    box-shadow: 5px 5px 0 var(--text);
    transform: translateY(-2px);
  }

  .description-box:active {
    box-shadow: 2px 2px 0 var(--text);
    transform: translateY(0);
  }

  .description-box p {
    color: var(--text);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
    font-weight: 500;
  }

  @media screen and (max-width: 768px) {
    .about-container {
      padding: 0.25rem;
      gap: 0.8rem;
    }

    .card-row {
      flex-direction: column;
      gap: 0.8rem;
    }

    .info-card {
      min-width: auto;
      max-width: 100%;
      padding: 0.8rem;
      box-shadow: 3px 3px 0 var(--text);
    }

    .info-card:hover {
      box-shadow: 4px 4px 0 var(--text);
    }

    .card-header h2 {
      font-size: 1rem;
    }

    .stat-number {
      font-size: 2rem;
    }

    .description-box {
      padding: 0.8rem;
      box-shadow: 2px 2px 0 var(--text);
    }

    .description-box p {
      font-size: 0.85rem;
    }
  }
</style>
