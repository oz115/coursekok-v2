<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tone: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'ai', 'trips', 'community'].includes(value),
  },
})
</script>

<template>
  <header class="page-header" :class="`page-header--${tone}`">
    <div class="page-header__main">
      <div v-if="$slots.icon" class="page-header__icon" aria-hidden="true">
        <slot name="icon" />
      </div>

      <div class="page-header__copy">
        <span class="page-header__eyebrow">{{ eyebrow }}</span>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
    </div>

    <div v-if="$slots.aside" class="page-header__aside">
      <slot name="aside" />
    </div>

    <!-- <div v-if="$slots.character" class="page-header__character" aria-hidden="true">
      <slot name="character" />
    </div> -->

    <span class="page-header__orb page-header__orb--one" aria-hidden="true" />
    <span class="page-header__orb page-header__orb--two" aria-hidden="true" />
  </header>
</template>

<style scoped>
.page-header {
  --header-accent: var(--coral-500);
  --header-accent-strong: var(--coral-700);
  --header-soft: var(--coral-50);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  min-height: 164px;
  padding: 30px 34px;
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--header-accent) 18%, var(--border-subtle));
  border-radius: 24px;
  background:
    linear-gradient(115deg, #fff 0%, #fff 55%, color-mix(in srgb, var(--header-soft) 78%, #fff) 100%);
  box-shadow: 0 12px 32px rgba(52, 42, 34, 0.07);
}

.page-header--ai {
  --header-accent: var(--sky-500);
  --header-accent-strong: var(--sky-700);
  --header-soft: var(--sky-50);
}

.page-header--trips {
  --header-accent: var(--coral-500);
  --header-accent-strong: var(--coral-700);
  --header-soft: var(--coral-50);
}

.page-header--community {
  --header-accent: var(--mint-500);
  --header-accent-strong: var(--mint-700);
  --header-soft: var(--mint-50);
}

.page-header--trips,
.page-header--community {
  height: 148px;
  min-height: 148px;
  padding: 12px 2px 28px;
  overflow: visible;
  border: 0;
  border-bottom: 1px solid var(--border-subtle);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.page-header--trips .page-header__icon {
  flex: none;
  width: auto;
  height: auto;
  border: none;
  background: none;
  box-shadow: none;
  border-radius: 0;
}

.page-header--trips .page-header__orb,
.page-header--community .page-header__orb {
  display: none;
}

.page-header__character {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

.page-header--community .page-header__character {
  right: 152px;
  bottom: 4px;
  width: 86px;
  height: 90px;
  overflow: hidden;
  opacity: .97;
}

.page-header--community .page-header__character :deep(.page-header-koki) {
  width: 84px;
  height: auto;
  transform: translateY(-8px) rotate(4deg);
  transform-origin: center top;
}


.page-header__main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.page-header__copy {
  max-width: 720px;
}

.page-header__icon {
  display: grid;
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--header-accent) 22%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--header-soft) 82%, #fff);
  box-shadow: inset 0 0 0 5px rgba(255, 255, 255, 0.48);
  color: var(--header-accent-strong);
}

.page-header__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: var(--header-accent-strong);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .12em;
}

.page-header__eyebrow::before {
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--header-accent);
  content: '';
}

.page-header--trips .page-header__eyebrow,
.page-header--community .page-header__eyebrow {
  min-height: 25px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--header-accent) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--header-soft) 82%, #fff);
  font-size: 10px;
  letter-spacing: .1em;
}

.page-header--trips .page-header__eyebrow::before,
.page-header--community .page-header__eyebrow::before {
  display: none;
}

.page-header h1 {
  color: var(--text-primary);
  font-size: clamp(29px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -.035em;
}

.page-header p {
  margin-top: 9px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.65;
}

.page-header__aside {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex: none;
}

.page-header__orb {
  position: absolute;
  border-radius: 50%;
  background: var(--header-accent);
  opacity: .08;
  pointer-events: none;
}

.page-header__orb--one {
  top: -72px;
  right: 118px;
  width: 180px;
  height: 180px;
}

.page-header__orb--two {
  right: 24px;
  bottom: -88px;
  width: 150px;
  height: 150px;
  opacity: .05;
}

@media (max-width: 720px) {
  .page-header {
    min-height: 0;
    padding: 24px 20px;
    margin-bottom: 22px;
    border-radius: 20px;
  }

  .page-header--trips,
  .page-header--community {
    height: 132px;
    min-height: 132px;
    padding: 6px 0 22px;
    border-radius: 0;
  }

  .page-header__aside {
    display: none;
  }

  .page-header__main {
    align-items: flex-start;
    gap: 14px;
  }

  .page-header__icon {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .page-header--community .page-header__character {
    right: 6px;
    bottom: 4px;
    width: 68px;
    height: 70px;
    opacity: .88;
  }

  .page-header--community .page-header__character :deep(.page-header-koki) {
    width: 66px;
    transform: translateY(-6px) rotate(4deg);
  }


  .page-header h1 {
    font-size: 28px;
  }

  .page-header p {
    font-size: 14px;
  }
}
</style>
