<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import { theme } from '../stores/theme';
  import project1Dark from '../../assets/portfolio-projects/project-1-dark.png';
  import project2Dark from '../../assets/portfolio-projects/project-2-dark.png';
  import project3Dark from '../../assets/portfolio-projects/project-3-dark.png';

  interface Project {
    title: string;
    image: string;
    demoUrl: string;
    githubUrl: string;
  }

  const projects: Project[] = [
    {
      title: 'PrintReactor',
      image: project1Dark,
      demoUrl: 'https://github.com/cheikhhachem/PrintReactor/releases',
      githubUrl: 'https://github.com/cheikhhachem/printreactor'
    },
    {
      title: 'Project Two',
      image: project2Dark,
      demoUrl: 'https://github.com/cheikhhachem',
      githubUrl: 'https://github.com/cheikhhachem'
    },
    {
      title: 'Project Three',
      image: project3Dark,
      demoUrl: 'https://github.com/cheikhhachem',
      githubUrl: 'https://github.com/cheikhhachem'
    }
  ];

  let currentIndex = 0;

  $: currentProject = projects[currentIndex];

  function navigateProject(direction: number) {
    currentIndex = (currentIndex + direction + projects.length) % projects.length;
  }

  function goToDemo() {
    window.open(currentProject.demoUrl, '_blank');
  }

  function goToGithub() {
    window.open(currentProject.githubUrl, '_blank');
  }
</script>

<div class="projects-container">
  <button class="nav-arrow left" on:click={() => navigateProject(-1)} aria-label="Previous project">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="3" stroke-linecap="square"/>
    </svg>
  </button>

  <div class="project-card">
    <div class="project-image-wrapper">
      {#key currentProject.image}
        <img
          class="project-image"
          src={currentProject.image}
          alt={currentProject.title}
        />
      {/key}
    </div>
    
    <div class="project-content">
      <h2 class="project-title">{currentProject.title}</h2>
      
      <div class="project-nav">
        <div class="project-dots">
          {#each projects as _, index}
            <button 
              class="dot"
              class:active={index === currentIndex}
              on:click={() => currentIndex = index}
              aria-label="Go to project {index + 1}"
            ></button>
          {/each}
        </div>
        
        <div class="project-actions">
          <button class="action-btn demo" on:click={goToDemo}>
            {t($language, 'demo')}
          </button>
          <button class="action-btn github" on:click={goToGithub}>
            {t($language, 'github')}
          </button>
        </div>
      </div>
    </div>
  </div>

  <button class="nav-arrow right" on:click={() => navigateProject(1)} aria-label="Next project">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="3" stroke-linecap="square"/>
    </svg>
  </button>
</div>

<style>
  .projects-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem;
  }

  .project-card {
    background: var(--bg);
    border: 2px solid var(--text);
    box-shadow: 4px 4px 0 var(--text);
    width: 100%;
    max-width: 500px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .project-card:hover {
    box-shadow: 6px 6px 0 var(--text);
    transform: translateY(-2px);
  }

  .project-image-wrapper {
    width: 100%;
    aspect-ratio: 1/1;
    height: auto;
    overflow: hidden;
    border-bottom: 2px solid var(--text);
    background: var(--bg);
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .project-content {
    padding: 0.8rem;
  }

  .project-title {
    font-size: 1.2rem;
    font-weight: 900;
    color: var(--text);
    margin: 0 0 0.7rem 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .project-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
  }

  .project-dots {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }

  .dot {
    width: 14px;
    height: 14px;
    border: 2px solid var(--text);
    background: var(--bg);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    padding: 0;
  }

  .dot:hover {
    transform: scale(1.2);
    box-shadow: 2px 2px 0 var(--text);
  }

  .dot.active {
    background: var(--text);
    box-shadow: 2px 2px 0 var(--text);
  }

  .project-actions {
    display: flex;
    gap: 0.6rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border: 2px solid var(--text);
    background: var(--bg);
    color: var(--text);
    font-family: "Changa", sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 2px 2px 0 var(--text);
  }

  .action-btn:hover {
    box-shadow: 5px 5px 0 var(--text);
    transform: translateY(-2px);
  }

  .action-btn:active {
    box-shadow: 2px 2px 0 var(--text);
    transform: translateY(0);
  }

  .action-btn.demo {
    background: var(--text);
    color: var(--bg);
  }

  .nav-arrow {
    width: 40px;
    height: 40px;
    border: 2px solid var(--text);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 2px 2px 0 var(--text);
    flex-shrink: 0;
  }

  .nav-arrow svg {
    width: 20px;
    height: 20px;
    transform: scaleX(1); /* Default LTR */
  }

  /* RTL Support for arrows */
  :global([dir="rtl"]) .nav-arrow svg {
    transform: scaleX(-1);
  }

  .nav-arrow:hover {
    box-shadow: 4px 4px 0 var(--text);
    transform: translateY(-2px);
  }

  .nav-arrow:active {
    box-shadow: 2px 2px 0 var(--text);
    transform: translateY(0);
  }

  .nav-arrow.left {
    margin-left: -0.5rem;
  }
  
  :global([dir="rtl"]) .nav-arrow.left {
    margin-left: 0;
    margin-right: -0.5rem;
  }

  .nav-arrow.right {
    margin-right: -0.5rem;
  }

  :global([dir="rtl"]) .nav-arrow.right {
    margin-right: 0;
    margin-left: -0.5rem;
  }

  @media screen and (max-width: 768px) {
    .projects-container {
      gap: 0.5rem;
      padding: 0.25rem;
    }

    .project-card {
      box-shadow: 4px 4px 0 var(--text);
    }

    .project-card:hover {
      box-shadow: 5px 5px 0 var(--text);
    }

    .project-image-wrapper {
      height: auto;
      aspect-ratio: 1/1;
    }

    .project-content {
      padding: 0.8rem;
    }

    .project-title {
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
    }

    .project-nav {
      flex-direction: column;
      gap: 0.8rem;
    }

    .project-actions {
      width: 100%;
    }

    .action-btn {
      flex: 1;
      padding: 0.5rem 0.8rem;
      font-size: 0.85rem;
    }

    .nav-arrow {
      width: 36px;
      height: 36px;
      box-shadow: 2px 2px 0 var(--text);
    }

    .nav-arrow svg {
      width: 18px;
      height: 18px;
    }
  }

  @media screen and (max-width: 480px) {
    .nav-arrow {
      width: 40px;
      height: 40px;
    }

    .nav-arrow.left {
      margin-left: -1rem;
    }

    :global([dir="rtl"]) .nav-arrow.left {
      margin-left: 0;
      margin-right: -1rem;
    }

    .nav-arrow.right {
      margin-right: -1rem;
    }

    :global([dir="rtl"]) .nav-arrow.right {
      margin-right: 0;
      margin-left: -1rem;
    }
  }
</style>
