(function () {
  const API_URL = "solar_estimates.json"; // Update path as needed

  let selectedRegion = null;
  let selectedBedrooms = null;
  let estimates = {};
  let addressList = [];
  let isProgrammaticPostcodeUpdate = false;

  // Generates Step 1: User input for postcode and number of bedrooms
  function createStep1() {
    return `
        <div class="solar-calc solar-calc__step solar-calc__step--1">
          <h2 class="solar-calc__title">Estimate your solar setup</h2>
          <p class="solar-calc__intro">
          Find out how many panels you need, how much it costs, and how much you could save. 
          We'll tailor your estimate if you own your home and your roof isn't flat, thatched or slate.
          </p>
          <div id="postcode-lookup-context">
            <input type="text" id="postcode" class="solar-calc__input idpc-input" placeholder="e.g. N10 2BN" autocomplete="off" aria-label="Postcode" />
          </div>

          <fieldset class="solar-calc__bedroom-group">
            <legend class="solar-calc__label">How many bedrooms?</legend>
            <button class="solar-calc__bedroom-btn" data-size="1-2">1-2 bedrooms</button>
            <button class="solar-calc__bedroom-btn" data-size="3">3 bedrooms</button>
            <button class="solar-calc__bedroom-btn" data-size="4+">4+ bedrooms</button>
          </fieldset>

          <button class="solar-calc__submit" disabled id="solar-submit">Let's go!</button>
        </div>
      `;
  }

  // Generates Step 2: Displays solar panel estimate results (updated layout)
  function createStep2(data, bedrooms) {
    const imgMap = {
      "1-2": "illustration-1-2-beds.svg",
      3: "illustration-3-beds.svg",
      "4+": "illustration-4-beds.svg",
    };

    return `
      <div class="solar-calc solar-calc__step solar-calc__step--2">
        <h2 class="solar-calc__title">Estimated Solar Potential for Your Property</h2>
        <p class="solar-calc__weather">
          ${estimates[selectedRegion]?.weatherInsight || ""}
        </p>
        <div class="solar-calc__grid">
          <div class="solar-calc__col solar-calc__col--image">
            <img class="solar-calc__image" src="${
              imgMap[bedrooms]
            }" alt="${bedrooms} bedroom home illustration">
          </div>
          <div class="solar-calc__col solar-calc__col--data">
            <ul class="solar-calc__details">
              <li><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg> <strong>£${data.cost.toLocaleString()}</strong> estimate</li>
              <li><svg fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 243.8 243.8" xml:space="preserve" stroke="#ffffff" class="size-6"><g><g><g><path d="M220.976,84.214h-6.054c-6.465-14.758-16.708-27.538-29.988-37.411l8.281-28.347c0.809-2.775-0.023-5.767-2.146-7.725c-2.128-1.96-5.179-2.551-7.872-1.514l-47.099,17.994c-5.653-0.799-11.301-1.202-16.82-1.202c-38.053,0-70.042,17.079-87.94,43.78c-13.46-1.174-16.008-9.987-16.282-11.149c-0.852-4.063-4.816-6.696-8.902-5.902c-4.124,0.804-6.817,4.801-6.011,8.925C1.456,68.396,8.03,80.075,23.6,83.882c-4.956,11.342-7.667,23.904-7.667,37.282c0,26.564,11.195,51.226,30.997,68.89c-9.853,10.457-9.668,26.98,0.561,37.206c5.044,5.047,11.755,7.827,18.892,7.827c7.137,0,13.845-2.78,18.892-7.827l12.815-12.815c15.828,2.843,32.702,2.417,48.068-1.154l13.969,13.972c5.047,5.044,11.758,7.824,18.892,7.824c7.134,0,13.842-2.78,18.892-7.827c10.411-10.416,10.411-27.365-0.003-37.784l-2.747-2.744c8.357-8.273,15.062-17.994,19.734-28.618h6.079c12.587,0,22.826-10.241,22.826-22.826V107.04C243.801,94.455,233.563,84.214,220.976,84.214z M228.584,135.278c0,4.195-3.414,7.609-7.609,7.609H209.77c-3.183,0-6.029,1.978-7.134,4.963c-4.679,12.628-12.754,23.954-23.356,32.755c-1.646,1.367-2.643,3.366-2.742,5.504s0.708,4.22,2.222,5.734l8.387,8.387c4.484,4.484,4.484,11.783,0.003,16.262c-2.171,2.174-5.06,3.371-8.131,3.371c-3.071,0-5.963-1.197-8.134-3.368l-17.025-17.028c-1.446-1.446-3.388-2.229-5.379-2.229c-0.675,0-1.352,0.089-2.019,0.271c-8.636,2.379-17.784,3.584-27.183,3.584c-7.505,0-14.933-0.789-22.08-2.343c-2.536-0.553-5.169,0.223-6.997,2.057l-15.689,15.689c-2.171,2.171-5.06,3.368-8.134,3.368c-3.071,0-5.96-1.197-8.134-3.368c-4.484-4.487-4.484-11.781,0-16.265l5.384-5.384c1.565-1.562,2.371-3.731,2.209-5.937c-0.16-2.206-1.276-4.233-3.051-5.549c-20.109-14.933-31.641-37.601-31.641-62.2c0-45.57,37.888-79.935,88.132-79.935c5.387,0,10.933,0.444,16.483,1.321c1.314,0.211,2.66,0.068,3.901-0.408l34.652-13.236L168.8,47.772c-0.936,3.206,0.327,6.65,3.117,8.486c14.362,9.468,24.992,22.681,30.739,38.208c1.106,2.985,3.954,4.968,7.134,4.968h11.185c4.195,0,7.609,3.414,7.609,7.609V135.278z"></path> <circle cx="166.674" cy="99.388" r="10.568"></circle> <rect x="97.142" y="55.216" width="44.383" height="15.217"></rect> </g></g></g></svg> <strong>${Math.round(
                (data.savingsMin / data.cost) * 100
              )}% - ${Math.round(
      (data.savingsMax / data.cost) * 100
    )}%</strong> typical bill savings</li>
              <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="size-6">
  <g clip-path="url(#clip0_109_1703)">
    <path d="M20 12H4L2 22H22L20 12ZM18.36 14L18.76 16H13V14H18.36ZM11 14V16H5.24L5.64 14H11ZM4.84 18H11V20H4.44L4.84 18ZM13 20V18H19.16L19.56 20H13Z" style="fill: rgb(255, 255, 255);"></path>
    <path d="M13 8H11V11H13V8Z" style="fill: rgb(255, 255, 255);"></path>
    <path d="M17.1787 5.79096L15.7645 7.20516L17.8858 9.32646L19.3 7.91226L17.1787 5.79096Z" style="fill: rgb(255, 255, 255);"></path>
    <path d="M6.82613 5.79149L4.70483 7.91279L6.11903 9.32699L8.24033 7.20569L6.82613 5.79149Z" style="fill: rgb(255, 255, 255);"></path>
    <path d="M6 2H3V4H6V2Z" style="fill: rgb(255, 255, 255);"></path>
    <path d="M21 2H18V4H21V2Z" style="fill: rgb(255, 255, 255);"></path>
    <path d="M12 7C14.76 7 17 4.76 17 2H15C15 3.65 13.65 5 12 5C10.35 5 9 3.65 9 2H7C7 4.76 9.24 7 12 7Z" style="fill: rgb(255, 255, 255);"></path>
  </g>
  <defs>
    <clipPath id="clip0_109_1703">
      <rect width="24" height="24" fill="white"></rect>
    </clipPath>
  </defs>
</svg> <strong>${data.panels}</strong> panels</li>
            </ul>
          </div>
        </div>
        <button class="solar-calc__quote" id="solar-quote">Get a quote</button>
      </div>
    `;
  }

  // Attaches UI event listeners for bedroom selection and form submission
  function bindEvents(container) {
    const bedroomBtns = container.querySelectorAll(".solar-calc__bedroom-btn");
    const submitBtn = container.querySelector("#solar-submit");

    bedroomBtns.forEach((btn) => {
      // Toggle bedroom button selection
      btn.addEventListener("click", function () {
        bedroomBtns.forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        selectedBedrooms = btn.dataset.size;
        if (container.querySelector("#postcode").value.trim()) {
          submitBtn.disabled = false;
        }
      });
    });

    const hiddenPostcodeInput = container.querySelector("#postcode");
    if (hiddenPostcodeInput) {
      // Observe changes to postcode input for re-enabling the CTA
      const observer = new MutationObserver(() => {
        if (hiddenPostcodeInput.value.trim() && selectedBedrooms) {
          submitBtn.disabled = false;
        }
      });
      observer.observe(hiddenPostcodeInput, {
        attributes: true,
        attributeFilter: ["value"],
      });
    }

    // Submit button logic: display results and trigger Chameleon tracking
    submitBtn.addEventListener("click", function () {
      const postcode = container.querySelector("#postcode").value.trim();
      // Normally here we’d map postcode to region – for now default to selectedRegion
      const result = estimates[selectedRegion]?.[selectedBedrooms];
      if (!result) return alert("Estimate not available for this combination.");
      container.innerHTML = createStep2(result, selectedBedrooms);

      container
        .querySelector("#solar-quote")
        .addEventListener("click", function () {
          window.chameleonSettings = {
            postcode: postcode,
            bedrooms: selectedBedrooms,
          };
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: "solarCalculatorSubmitted" });
          // Trigger Chameleon form/modal
        });
    });
  }

  // Initializes the calculator, loads estimates, and injects UI + postcode lookup
  function init() {
    const container = document.getElementById("calculator");
    if (!container) {
      console.error("❌ #calculator container not found");
      return;
    }

    // Fetch internal estimate data
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        estimates = data;
        // Create and inject Step 1 HTML
        container.innerHTML = createStep1();

        // Create dropdown for address selection
        const postcodeInput = container.querySelector("#postcode");
        const dropdown = document.createElement("select");
        dropdown.className = "solar-calc__dropdown";
        dropdown.style.marginTop = "0.5rem";
        dropdown.style.display = "none";
        postcodeInput.insertAdjacentElement("afterend", dropdown);

        function hideDropdown() {
          dropdown.innerHTML = "";
          dropdown.size = 0;
          dropdown.style.display = "none";
        }

        // Fetch address suggestions based on user-typed postcode
        postcodeInput.addEventListener("input", function () {
          if (isProgrammaticPostcodeUpdate) {
            isProgrammaticPostcodeUpdate = false;
            return;
          }
          const postcode = postcodeInput.value
            .trim()
            .replace(/\s+/g, "")
            .toUpperCase();
          if (postcode.length < 5) return;

          fetch(
            `https://api.ideal-postcodes.co.uk/v1/addresses?postcode=${postcode}&api_key=ak_maz7xh95LDak6nnfwtMKdsedW3PsN`
          )
            .then((res) => res.json())
            .then((data) => {
              if (
                !Array.isArray(data.result?.hits) ||
                data.result.hits.length === 0
              )
                return hideDropdown();

              addressList = data.result.hits;
              dropdown.innerHTML = addressList
                .map(
                  (addr, index) =>
                    `<option value="${index}">${addr.line_1}, ${addr.post_town}, ${addr.postcode}</option>`
                )
                .join("");
              dropdown.size = Math.min(addressList.length, 6); // show up to 6 items before scrolling
              dropdown.style.display = "block";
            })
            .catch(() => {
              hideDropdown();
            });
        });

        // Remove native "change" listener, instead bind click on each option
        dropdown.addEventListener("mousedown", function (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (e.target && e.target.nodeName === "OPTION") {
            const selectedIndex = parseInt(e.target.value, 10);
            const address = addressList[selectedIndex];
            hideDropdown();
            dropdown.selectedIndex = -1;

            const fullAddress = `${address.line_1}, ${address.post_town}, ${address.postcode}`;
            isProgrammaticPostcodeUpdate = true;
            postcodeInput.value = fullAddress;
            postcodeInput.defaultValue = fullAddress;
            postcodeInput.dispatchEvent(new Event("input", { bubbles: true }));

            const prefix = address.postcode_outward?.match(/^[A-Z]{1,2}/)?.[0];
            selectedRegion = estimates.regionMap?.[prefix] || "South East";

            if (selectedBedrooms) {
            }
          }
        });

        // Bind UI events
        bindEvents(container);
      })
      .catch((err) => {
        console.error("Failed to load solar estimate data:", err);
        container.innerHTML =
          '<p class="solar-calc__error">Unable to load calculator. Please try again later.</p>';
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
