<template>
  <div id="main-lay-head">
    <nav id="mlh-nav">
      <RouterLink :to="{ name: 'ssr' }">
        <p class="mlhn-item">SSR</p>
      </RouterLink>
      <RouterLink :to="{ name: 'csr' }">
        <p class="mlhn-item">CSR</p>
      </RouterLink>
      <RouterLink :to="{ name: 'ssg' }">
        <p class="mlhn-item">SSG</p>
      </RouterLink>
      <RouterLink :to="{ name: 'isr' }">
        <p class="mlhn-item">ISR</p>
      </RouterLink>
    </nav>
    <div id="mlh-banner" @click="$router.push({ name: 'index' })">
      <div id="mlhb-cont">
        <b>Quasar.js</b>
        <h1>Hybrid Rendering</h1>
        <p>Extension</p>
      </div>
      <picture id="mlhb-universe">
        <source
          type="image/webp"
          srcset="@/assets/universe-512.webp"
          media="(max-width: 512px)"
          width="512"
          height="327"
        />
        <source
          type="image/webp"
          srcset="@/assets/universe-768.webp"
          media="(max-width: 768px)"
          width="768"
          height="491"
        />
        <source
          type="image/webp"
          srcset="@/assets/universe-1252.webp"
          width="1252"
          height="800"
        />
        <source
          type="image/jpeg"
          srcset="@/assets/universe-512.jpg"
          media="(max-width: 512px)"
          width="512"
          height="327"
        />
        <source
          type="image/jpeg"
          srcset="@/assets/universe-768.jpg"
          media="(max-width: 768px)"
          width="768"
          height="491"
        />
        <source
          type="image/jpeg"
          srcset="@/assets/universe-1252.jpg"
          width="1252"
          height="800"
        />
        <img
          src="@/assets/universe-1252.jpg"
          alt="universe illustration"
          width="1252"
          height="800"
        />
      </picture>
      <picture id="mlhb-icon">
        <source
          type="image/webp"
          srcset="/icons/favicon-64x64.webp"
          media="(max-width: 768px)"
          width="64"
          height="64"
        />
        <source
          type="image/webp"
          srcset="/icons/favicon-128x128.webp"
          width="128"
          height="128"
        />
        <source
          type="image/png"
          srcset="/icons/favicon-64x64.png"
          media="(max-width: 768px)"
          width="64"
          height="64"
        />
        <source
          type="image/png"
          srcset="/icons/favicon-128x128.png"
          width="128"
          height="128"
        />
        <img
          src="/icons/favicon-128x128.png"
          alt="quasar icon"
          width="128"
          height="128"
        />
      </picture>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainLayoutHeader",
});
</script>

<style scoped>
#main-lay-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-bottom: 64px;
  background: linear-gradient(
    180deg,
    rgba(11, 12, 26, 1) 0% 0%,
    rgba(48, 88, 104, 1) 100% 100%
  );
}

#mlh-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(1% + 12px);
  width: 100%;
  padding: 16px 8px;
}

#mlh-nav > a {
  text-decoration: none;
  color: white;
  transition: 0.2s all;
}

#mlh-nav > a:hover {
  color: #bbdefb;
}

.mlhn-item {
  font-size: 20px;
}

#mlh-banner {
  aspect-ratio: 512 / 327;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70%;
  border-radius: 60px;
  box-shadow: 0px 4px 6px 0px rgba(187, 69, 79, 1);
  cursor: pointer;
}

#mlhb-cont {
  z-index: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

#mlhb-cont > b {
  font-size: 22px;
  color: #bbdefb;
}

#mlhb-cont > h1 {
  font-size: 36px;
  color: white;
}

#mlhb-cont > p {
  font-size: 22px;
  color: white;
}

#mlhb-universe {
  z-index: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  border-radius: 5vw;
  overflow: hidden;
}

#mlhb-universe > img {
  width: 100%;
}

#mlhb-icon {
  z-index: 1;
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 128px;
  transform: translate(-50%, 40%);
}

#mlhb-icon > img {
  width: 100%;
}

@media only screen and (max-width: 768px) {
  #mlh-banner {
    width: 90%;
  }

  #mlhb-icon {
    width: 64px;
  }
}

@media only screen and (max-width: 512px) {
  #mlhb-cont {
    gap: 4px;
    top: -16px;
  }

  #mlhb-cont > b {
    font-size: 18px;
  }

  #mlhb-cont > h1 {
    font-size: 28px;
  }

  #mlhb-cont > p {
    font-size: 18px;
  }
}
</style>
