<script lang="ts">
  import { language } from '../stores/language';
  import { t } from '../utils/translations';

  const email = 'contact@hachem.pro';
  const whatsapp = '22244370552';

  function openEmail() {
    window.location.href = `mailto:${email}`;
  }

  function openWhatsApp() {
    window.open(`https://wa.me/${whatsapp}`, '_blank');
  }
</script>

<div class="contact-container">
  <div class="contact-header">
    <h5>{t($language, 'getInTouch')}</h5>
    <h2>{t($language, 'contactMe')}</h2>
  </div>

  <div class="contact-grid">
    <div class="contact-card email-card" on:click={openEmail} on:keydown={(e) => e.key === 'Enter' && openEmail()} role="button" tabindex="0">
      <div class="card-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
          <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>{t($language, 'email')}</h3>
      <p class="contact-detail">{email}</p>
      <div class="card-arrow">→</div>
    </div>

    <div class="contact-card whatsapp-card" on:click={openWhatsApp} on:keydown={(e) => e.key === 'Enter' && openWhatsApp()} role="button" tabindex="0">
      <div class="card-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.652c1.746.953 3.713 1.454 5.71 1.454h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.457z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
      <h3>{t($language, 'whatsapp')}</h3>
      <p class="contact-detail" dir="ltr">+{whatsapp}</p>
      <div class="card-arrow">→</div>
    </div>
  </div>

  <div class="contact-footer">
    <p>{t($language, 'letsTalk')}</p>
  </div>
</div>

<style>
  .contact-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    padding: 0.3rem;
    max-width: 700px;
    margin: 0 auto;
  }

  .contact-header {
    text-align: center;
  }

  .contact-header h5 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 0.3rem 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.8;
  }

  .contact-header h2 {
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--text);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    width: 100%;
  }

  .contact-card {
    background: var(--bg);
    border: 2px solid var(--text);
    box-shadow: 3px 3px 0 var(--text);
    padding: 1rem;
    cursor: pointer;
    position: relative;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .contact-card:hover {
    box-shadow: 6px 6px 0 var(--text);
    transform: translateY(-2px);
  }

  .contact-card:active {
    box-shadow: 3px 3px 0 var(--text);
    transform: translateY(0);
  }

  .card-icon {
    width: 50px;
    height: 50px;
    border: 2px solid var(--text);
    background: var(--text);
    color: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .card-icon svg {
    width: 30px;
    height: 30px;
  }

  .contact-card:hover .card-icon {
    transform: scale(1.1) rotate(-5deg);
  }

  .contact-card h3 {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .contact-detail {
    font-size: 1rem;
    color: var(--text);
    font-weight: 600;
    margin: 0;
    opacity: 0.8;
  }

  .card-arrow {
    position: absolute;
    bottom: 1rem;
    right: 1.5rem;
    font-size: 2rem;
    font-weight: 900;
    color: var(--text);
    transition: all 0.3s ease;
  }

  .contact-card:hover .card-arrow {
    transform: translateX(5px);
  }

  .contact-footer {
    background: var(--text);
    color: var(--bg);
    border: 2px solid var(--text);
    padding: 1rem 2rem;
    box-shadow: 3px 3px 0 var(--text);
  }

  .contact-footer p {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  @media screen and (max-width: 768px) {
    .contact-container {
      gap: 1.5rem;
      padding: 0.25rem;
    }

    .contact-header h2 {
      font-size: 1.5rem;
    }

    .contact-header h5 {
      font-size: 0.85rem;
    }

    .contact-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .contact-card {
      padding: 1rem;
      box-shadow: 3px 3px 0 var(--text);
    }

    .contact-card:hover {
      box-shadow: 4px 4px 0 var(--text);
    }

    .card-icon {
      width: 48px;
      height: 48px;
    }

    .card-icon svg {
      width: 28px;
      height: 28px;
    }

    .contact-card h3 {
      font-size: 1.1rem;
    }

    .contact-detail {
      font-size: 0.85rem;
    }

    .contact-footer {
      padding: 1rem 1.5rem;
    }

    .contact-footer p {
      font-size: 0.9rem;
    }
  }
</style>
