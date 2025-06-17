(() => {
  const self = {
    init: async () => {
      const isHomepage =
        location.hostname.includes("e-bebek.com") &&
        (location.pathname === "/");
      if (!isHomepage) return;

      self.products = await self.fetchProducts();
      self.renderHTML();
      self.injectCSS();
      self.setEvents();
    },

    fetchProducts: async () => {
      const cached = localStorage.getItem("product-list");
      if (cached) return JSON.parse(cached);
      const res = await fetch("https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json");
      const data = await res.json();
      localStorage.setItem("product-list", JSON.stringify(data));
      return data;
    },

    renderHTML: () => {
      const favorites = JSON.parse(localStorage.getItem("favorite-products") || "[]");
      const html = `
        <div class="carousel-wrapper">
          <button class="arrow left">‹</button>
          <div class="carousel-container">
            <div class="carousel-header">
              <h2>Beğenebileceğinizi düşündüklerimiz</h2>
            </div>
            <div class="carousel-content">
              <div class="cards"></div>
            </div>
          </div>
          <button class="arrow right">›</button>
        </div>
      `;
      const target = document.querySelector("eb-product-carousel");
      if (target) {
        target.insertAdjacentHTML("beforebegin", html);
      } else {
        document.body.insertAdjacentHTML("beforeend", html);
      }

      const cards = document.querySelector(".cards");

      self.products.forEach(p => {
        const id = p.url.split("?")[0].split("/").pop();
        const fav = favorites.includes(id);
        const discounted = p.original_price && p.original_price !== p.price;
        const discount = discounted ? Math.round((1 - p.price / p.original_price) * 100) : null;

        const card = document.createElement("div");
        card.className = "card";
        card.dataset.href = p.url;

        card.innerHTML = `
          <div class="heart">
            <img class="${fav ? "filled-heart" : ""}" 
              src="${fav
                ? "https://www.e-bebek.com/assets/svg/added-favorite.svg"
                : "https://img.icons8.com/ios/50/000000/like--v1.png"}">
          </div>
          <img src="${p.img}" alt="${p.name}">
          <div class="name"><b>${p.brand}</b> – ${p.name}</div>
          <div class="price">
            ${discounted ? `<span class="old">${p.original_price.toFixed(2)} TL</span>` : ""}
            ${discount ? `<span class="discount">%${discount}</span>` : ""}
            <span class="new" style="color:${discounted ? '#008000' : '#000'}">${p.price.toFixed(2)} TL</span>
          </div>
          <button class="add-btn">Sepete Ekle</button>
        `;

        cards.appendChild(card);
      });
    },

    setEvents: () => {
      const container = document.querySelector(".cards");

      document.querySelector(".arrow.left").addEventListener("click", () => {
        const card = document.querySelector(".card");
        if (!card) return;
        const cardWidth = card.offsetWidth + 20;
        container.scrollBy({ left: -cardWidth, behavior: "smooth" });
      });

      document.querySelector(".arrow.right").addEventListener("click", () => {
        const card = document.querySelector(".card");
        if (!card) return;
        const cardWidth = card.offsetWidth + 20;
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      });

      document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", e => {
          if (!e.target.classList.contains("add-btn") && !e.target.closest(".heart")) {
            window.open(card.dataset.href, "_blank");
          }
        });
      });

      document.querySelectorAll(".heart").forEach(wrapper => {
        wrapper.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          const card = wrapper.closest(".card");
          const icon = wrapper.querySelector("img");
          const id = card.dataset.href.split("?")[0].split("/").pop();
          let favs = JSON.parse(localStorage.getItem("favorite-products") || "[]");
          const idx = favs.indexOf(id);

          if (idx > -1) {
            favs.splice(idx, 1);
            icon.src = "https://img.icons8.com/ios/50/000000/like--v1.png";
            icon.classList.remove("filled-heart");
          } else {
            favs.push(id);
            icon.src = "https://www.e-bebek.com/assets/svg/added-favorite.svg";
            icon.classList.add("filled-heart");
          }

          localStorage.setItem("favorite-products", JSON.stringify(favs));
        });
      });
    },

    injectCSS: () => {
      const css = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        .carousel-wrapper { display: flex; align-items: center; justify-content: center; margin: 40px 0; gap: 16px; }
        .carousel-container { max-width: 1400px; flex: 1; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 32px; overflow: hidden; background: white; }
        .carousel-header { background: #fef6eb; padding: 24px 32px 12px; }
        .carousel-header h2 { font-size: 28px; font-weight: 600; color: #f28e00; margin: 0; }
        .carousel-content { display: flex; align-items: center; padding: 20px 32px; gap: 16px; background: #fff; }
        .cards { display: flex; overflow-x: hidden; gap: 16px; flex: 1; }
        .arrow { flex-shrink: 0; width: 40px; height: 40px; font-size: 22px; border: none; background: #fff4e2; color: #f28e00; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: background 0.2s ease; }
        .arrow:hover { background: #ffe3b9; }
        .card { flex: 0 0 calc((100% - 64px) / 5); max-width: 245px; min-height: 440px; border: 0.666px solid #ededed; border-radius: 10px; padding: 12px; background: #fff; color: #333; position: relative; display: flex; flex-direction: column; transition: border 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .card:hover { border: 2px solid #f28e00; box-shadow: 0 0 0 3px rgba(242, 142, 0, 0.2); }
        .card img { width: 100%; border-radius: 6px; object-fit: contain; margin-bottom: 10px; }
        .name { font-size: 14px; font-weight: 500; margin-top: 6px; line-height: 1.5; height: 3em; overflow: hidden; }
        .price { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 10px 0; }
        .price .old { text-decoration: line-through; font-size: 12px; color: #999; }
        .price .discount { background: #00a650; color: white; padding: 2px 8px; font-size: 13px; font-weight: bold; border-radius: 12px; }
        .price .new { font-size: 16px; font-weight: 600; }
        .add-btn { margin-top: auto; background: #fff0d8; color: #f28e00; font-weight: bold; font-size: 14px; padding: 12px; border-radius: 999px; border: none; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { background: #f28e00; color: white; }
        .carousel-wrapper .heart img:not(.filled-heart) {
          width: 30px;
          height: 30px;
          margin-top: 12px;
          margin-left: 10px;
        }
        .carousel-wrapper .heart {
          position: absolute;
          right: 8px;
        }
        @media (max-width: 1200px) { .card { flex: 0 0 calc((100% - 48px) / 4); } }
        @media (max-width: 992px) { .card { flex: 0 0 calc((100% - 32px) / 3); } }
        @media (max-width: 768px) { .card { flex: 0 0 calc((100% - 16px) / 2); } }
        @media (max-width: 480px) { .card { flex: 0 0 100%; } }
      `;
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    }
  };

  self.init();
})();
