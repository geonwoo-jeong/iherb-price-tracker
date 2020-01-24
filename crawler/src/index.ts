import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

interface Country {
  [country: string]: {
    countrycode: "EN" | "KR" | "JP";
    languageCode: "en-US" | "ko-KR" | "ja-JP";
    currencySymbol: "$" | "₩" | "¥";
  };
}

interface ProductList {
  id: number;
  title: string;
  price: number;
  onSale: boolean;
}

const country: Country = {
  usa: {
    countrycode: "EN",
    languageCode: "en-US",
    currencySymbol: "$"
  },
  korea: {
    countrycode: "KR",
    languageCode: "ko-KR",
    currencySymbol: "₩"
  },
  japan: {
    countrycode: "JP",
    languageCode: "ja-JP",
    currencySymbol: "¥"
  }
};

const productList: ProductList[] = [];
let page = 7;
let lastPage: number;

const getHtml = async (page: number, country: any): Promise<AxiosResponse> => {
  return await axios.get(`https://iherb.com/c/Categories?noi=192&p=${page}`, {
    headers: {
      cookie: `iher-pref1=sccode=${country.countryCode}&lan=${country.languageCode}&scurcode=USD&wp=2&lchg=0&ifv=1&storeid=0&ctd=www&bi=0&lp=10`
    }
  });
};

const getProductData = ($: CheerioStatic, elem: CheerioElement) => {
  const id = Number(
    $(elem)
      .find("div.ga-product")
      .attr("itemid")
      ?.trim()
      ?.replace("pid_", "")
  );
  const title = String(
    $(elem)
      .find("div.product-title")
      .text()
      .trim()
  );
  const price = Number(
    $(elem)
      .find("span.price bdi")
      .text()
      .trim()
      .replace("$", "")
      .replace("₩", "")
      .replace("¥", "")
  );

  return { id, title, price, onSale: true };
};

const init = async () => {
  const html = await getHtml(page, country.usa);
  const $ = cheerio.load(html.data);
  const $productList = $("div.products").children("div.product-cell-container");
  const $pages = $("div.pagination").children("a.pagination-link");

  lastPage = ($pages
    .last()
    .attr("href")
    ?.slice(-3) as unknown) as number;

  $productList.each((i, elem) => {
    productList.push(getProductData($, elem));
  });

  console.log(productList);
};

init();
