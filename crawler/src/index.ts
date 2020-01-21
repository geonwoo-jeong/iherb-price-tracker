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

const getHtml = async (
  page: number = 1,
  country: any
): Promise<AxiosResponse> => {
  return await axios.get(`https://iherb.com/c/Categories?noi=192&p=${page}`, {
    headers: {
      cookie: `iher-pref1=sccode=${country.countryCode}&lan=${country.languageCode}&scurcode=USD&wp=2&lchg=0&ifv=1&storeid=0&ctd=www&bi=0&lp=10`
    }
  });
};

getHtml(1, country.USA).then(html => {
  const productList: ProductList[] = [];
  const $ = cheerio.load(html.data);
  const $productList = $("div.products").children("div.product-cell-container");

  $productList.each((i, elem) => {
    const id = ($(elem)
      .find("div.ga-product")
      .attr("itemid")
      ?.trim()
      ?.replace("pid_", "") as unknown) as number;
    const title = $(elem)
      .find("div.product-title")
      .text()
      .trim() as string;
    const price = ($(elem)
      .find("span.price bdi")
      .text()
      .trim()
      .replace("$", "")
      .replace("₩", "")
      .replace("¥", "") as unknown) as number;

    productList.push({
      id,
      title,
      price
    });
  });

  // console.log(productList);
  // const data = ulList.filter(n => n.title);
  // return data;
});
// .then(res => console.log(res));
