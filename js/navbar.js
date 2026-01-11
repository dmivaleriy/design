class IdsNavbar extends HTMLElement {
  static #items = document.getElementsByTagName("ids-nav-item");
  static #instances = document.getElementsByTagName("ids-navbar");

  #listItems = []

  constructor() {
    super();
    this.render();
  }

  static updateItems() {
    for (const instance of this.#instances) {
      instance.render();
    }
    this.updateCurrent();
  }

  static updateCurrent() {
    let highestTopPositionIndex = -1;
    for (let i = 0; i < this.#items.length; i++) {
      let { bottom, top } = this.#items[i].getBoundingClientRect() ?? {
        top: 0,
        bottom: 0,
      };
      let topPosition = (top + bottom) / 2;
      if (topPosition < 0) {
        highestTopPositionIndex = i;
      }
      if (topPosition >= 0 && topPosition < window.innerHeight / 2) {
        highestTopPositionIndex = i;
        break;
      }
    }
    
    // Only update if a section is actually in view
    if (highestTopPositionIndex >= 0) {
      let id = this.#items[highestTopPositionIndex].getAttribute("id");
      const newHash = `#${id}`;
      if (window.location.hash !== newHash) {
        try {
          history.replaceState({}, "", newHash);
        } catch (e) {}
      }

      for (const instance of this.#instances) {
        instance.setCurrent(highestTopPositionIndex);
      }

      // Update header menu items
      this.updateHeaderMenu(id);
    } else {
      // No section in view - clear all current states
      for (const instance of this.#instances) {
        instance.setCurrent(-1);
      }
      this.updateHeaderMenu(null);
    }
  }

  static updateHeaderMenu(activeId) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      const href = item.getAttribute('href');
      if (activeId && href === `#${activeId}`) {
        item.classList.add('current');
      } else {
        item.classList.remove('current');
      }
    });
  }

  setCurrent(index) {
    for (let i = 0; i < this.#listItems.length; i += 1) {
      if (i === index && index >= 0) {
        this.#listItems[i].classList.add("current");
      } else {
        this.#listItems[i].classList.remove("current");
      }
    }
  }

  render() {
    this.innerHTML = "";
    this.#listItems.length = 0;

    this.classList.add("ids__navbar");
    const ul = document.createElement("ul");
    for (const item of IdsNavbar.#items) {
      const li = document.createElement("li");
      this.#listItems.push(li);

      {
        const a = document.createElement("a");
        a.href = `#${item.getAttribute("id")}`;
        a.textContent = item.getAttribute("label");
        li.appendChild(a);
      }

      ul.appendChild(li);
    }
    this.appendChild(ul);
  }
}

// TODO можно добавлять/убирать этот лисенер
document.addEventListener("scroll", () => IdsNavbar.updateCurrent());

class IdsNavItem extends HTMLElement {
  constructor() {
    super();
    this.classList.add("ids__nav-item");
  }

  connectedCallback() {
    IdsNavbar.updateItems();
  }
  disconnectedCallback() {
    IdsNavbar.updateItems();
  }
}

window.customElements.define("ids-navbar", IdsNavbar);
window.customElements.define("ids-nav-item", IdsNavItem);

// Menu items are inactive by default - they only become active on scroll
