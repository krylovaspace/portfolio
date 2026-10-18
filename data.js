/*
  Весь контент сайта — здесь. Меняешь этот файл, остальной код не трогаешь.

  Картинки и видео кладёшь в папку assets/img/
  Видео (.mp4) проигрываются сами, без звука, по кругу.
  \n в тексте — перенос строки (только на десктопе, на телефоне текст переносится сам).
  poster — кадр, который виден, пока грузится видео.
  fit: "inset" — видео по центру карточки с полями (для широких роликов).
  mobileFile — отдельный файл только для телефона, mobileCaption — своя подпись для телефона.
  mobile: номер карточки на телефоне (1 — первая). false — на телефоне не показывать.
*/

window.SITE = {

  // Сетка Visual sketches — порядок как на сайте, слева направо, сверху вниз
  sketches: [
    { file: "sketch-01.jpg", mobile: 1, caption: "part of my assessment presentation\nat loo.ch" },
    { file: "sketch-02.jpg", mobile: 2, caption: "concept for tatyana kochnova atelier {experiment}" },
    { file: "sketch-03.mp4", poster: "sketch-03-poster.jpg", mobile: 3, caption: "part of my assessment presentation\nat loo.ch" },
    { file: "sketch-04.jpg", mobile: 4, caption: "design for communication page\nfor loo.ch" },

    { file: "sketch-05.jpg", mobile: 5, caption: "dark theme for Yandex Pay product landing page" },
    { file: "sketch-06.mp4", poster: "sketch-06-poster.jpg", mobile: 6, caption: "design for alvi salotti — a company that sells luxury sofas" },
    { file: "sketch-07.jpg", mobile: 7, caption: "concept for tatyana kochnova atelier {experiment}" },
    { file: "sketch-08.mp4", poster: "sketch-08-poster.jpg", fit: "inset", mobile: false, caption: "design for the main page luluwomen —\na company that resells branded items" },

    { file: "sketch-09.jpg", mobile: false, caption: "design for the SKOLKOVO MANAGMENT school program page" },
    { file: "sketch-10.jpg", mobile: 8, caption: "light theme for Yandex Pay product landing page" },
    { file: "sketch-11.mp4", poster: "sketch-11-poster.jpg", mobileFile: "sketch-11-mobile.mp4", mobilePoster: "sketch-11-mobile-poster.jpg", mobileCaption: "design for communication page at Looch studio", mobile: 9, caption: "main page concept UrbanTech — company that develops technologies for urban and road safety" },
    { file: "sketch-12.jpg", mobile: 10, caption: "concept for tatyana kochnova atelier {experiment}" }
  ],

  // Список Works. preview — картинка, которая выезжает при наведении
  works: [
    {
      name: "Alvi Salotti",
      text: "design online store promotion with\na focus on interaction for a company\nselling luxury furniture",
      status: "developed project",
      action: "view site",
      url: "https://alvisalotti.ru/",
      preview: "work-alvi.jpg"
    },
    {
      name: "Tatyana Kochnova Atelier",
      text: "promotional website design\nfor a studio specializing in evening\nand wedding dresses",
      status: "concept project",
      action: "view case",
      url: "https://dprofile.ru/case/32480/tatyana-kochnova-atelier",
      preview: "work-kochnova.jpg"
    },
    {
      name: "NPO LKP",
      text: "design corporate website catalog\nfor a company promoting the production\nof paint booths and painting lines",
      status: "developed project",
      action: "view site",
      url: "https://www.niilkp.ru/",
      preview: "work-npo.jpg"
    },
    {
      name: "GorInzh\nProject",
      text: "design of a multi-page website\nfor an urban infrastructure\nconstruction campaign",
      status: "developed project",
      action: "view site",
      url: "https://goringstroy.ru/",
      preview: "work-gorinzh.jpg"
    }
  ]
};
