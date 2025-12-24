<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  let name = $state("");
  let greetMsg = $state("");
  let bool = invoke<boolean>("check_first_run").then((res) => {
    console.log("Is first run:", res);
    return res;
  });

</script>

<main class="container">
  <h1>Update the Frontend</h1>
  <p>Please Update this part or replace this with the Frontend</p>
  <p>{greetMsg}</p>
</main>

<style>

:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  /* background-color: #f6f6f6; */
background-color: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background-color: transparent;
}


h1 {
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: whitesmoke;
    /* background-color: #2f2f2f; */
    background-color: transparent;
  }
}
@media (prefers-color-scheme: light) {
  :root {
    color: black;
    /* background-color: #2f2f2f; */
    background-color: transparent;
  }
}
</style>
