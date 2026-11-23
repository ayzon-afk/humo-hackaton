<script setup>
import SiteNav from '@/components/site/SiteNav.vue';
import SiteHero from '@/components/site/SiteHero.vue';
import StoryScroll from '@/components/site/StoryScroll.vue';
import SiteFeatures from '@/components/site/SiteFeatures.vue';
import SiteCta from '@/components/site/SiteCta.vue';
import SiteFooter from '@/components/site/SiteFooter.vue';
import '@/styles/site.css';
</script>

<template>
  <div class="site">
    <SiteNav />
    <main>
      <SiteHero />
      <StoryScroll />
      <SiteFeatures />
      <SiteCta />
    </main>
    <SiteFooter />
  </div>
</template>
