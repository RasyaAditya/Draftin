<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface text-ink">
    <header class="border-b border-line">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="font-display text-lg tracking-tight">
          Draftin
        </NuxtLink>
        <nav class="flex gap-6 text-sm text-ink-muted">
          <NuxtLink to="/katalog">Katalog</NuxtLink>
          <NuxtLink to="/portofolio">Portofolio</NuxtLink>
          <NuxtLink to="/tentang">Tentang</NuxtLink>
          <NuxtLink to="/kontak">Kontak</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-line">
      <div class="mx-auto max-w-6xl px-6 py-8 text-sm text-ink-muted">
        &copy; {{ new Date().getFullYear() }} Draftin. Semua hak cipta dilindungi.
      </div>
    </footer>
  </div>
</template>
