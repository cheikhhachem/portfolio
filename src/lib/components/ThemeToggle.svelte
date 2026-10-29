<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';
  import { theme, themeTransition, requestedTheme } from '../stores/theme';
</script>

<div id="color-mode">
  <label class="switch">
    <input 
      type="checkbox" 
      class="toggle"
      checked={$requestedTheme === 'dark'}
      aria-label={t($language, $requestedTheme === 'dark' ? 'useLightTheme' : 'useDarkTheme')}
      aria-busy={$themeTransition.phase !== 'idle'}
      on:change={() => theme.toggle()}
    >
    <span class="slider">
      <span class="slider-button">
        <i class="fas fa-sun icon-sun"></i>
        <i class="fas fa-moon icon-moon"></i>
      </span>
    </span>
  </label>
</div>

<style>
  #color-mode {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .switch {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 32px;
  }

  .toggle {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle:focus-visible + .slider { outline: 2px solid var(--text); outline-offset: 6px; }

  .slider {
    box-sizing: border-box;
    border-radius: 8px;
    border: 2px solid var(--text);
    box-shadow: 4px 4px 0 var(--text);
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .slider-button {
    box-sizing: border-box;
    position: absolute;
    height: 24px;
    width: 24px;
    border: 2px solid var(--text);
    border-radius: 6px;
    left: 2px;
    bottom: 1px;
    background-color: var(--bg);
    box-shadow: 0 3px 0 var(--text);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slider:hover {
    box-shadow: 6px 6px 0 var(--text);
    transform: translateY(-2px);
  }

  .slider:active {
    box-shadow: 2px 2px 0 var(--text);
    transform: translateY(0);
  }

  .icon-sun,
  .icon-moon {
    font-size: 0.7rem;
    position: absolute;
    transition: all 0.3s ease;
    color: var(--text);
  }

  /* Light mode - only sun is visible on slider button */
  .toggle:not(:checked) ~ .slider .slider-button .icon-moon {
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }

  .toggle:not(:checked) ~ .slider .slider-button .icon-sun {
    opacity: 1;
    transform: scale(1);
  }

  /* Dark mode - only moon is visible on slider button */
  .toggle:checked + .slider {
    background-color: var(--bg);
  }

  .toggle:checked + .slider .slider-button {
    transform: translateX(36px);
  }

  .toggle:checked + .slider .slider-button .icon-sun {
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }

  .toggle:checked + .slider .slider-button .icon-moon {
    opacity: 1;
    transform: scale(1);
  }

  /* Hover effects */
  .switch:hover .slider-button {
    box-shadow: 0 4px 0 var(--text);
  }
</style>
