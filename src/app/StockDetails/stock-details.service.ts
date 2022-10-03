import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";
import { StockDetails } from "./stock-details.model";
import { StockPrice } from "./stock-price.model";
import { CompanyNews } from "./company-news.model";
import { HistoricalData } from "./highcharts.model";
import { mentions } from "./mentions.model";
import { redditObj } from "./reddit.model";
import { RecTrends } from "./trends.model";


@Injectable({ providedIn: "root" })
export class StockDetailsService {
  private info!: StockDetails;
  private priceinfo!: StockPrice;
  private candleData!: HistoricalData;
  private hourlyData!: HistoricalData;
  private allRedditData: redditObj[] = [];
  //private mentiondata!: mentions;
  private allTwitterData: redditObj[] = [];
  private companynews: CompanyNews[] = [];
  private trends: RecTrends[] = [];

  private stocksFetched = new Subject<StockDetails>();
  private pricesFetched = new Subject<StockPrice>();
  private candleDataFetched = new Subject<HistoricalData>();
  private hourlyDataFetched = new Subject<HistoricalData>();
  private newsUpdated = new Subject<CompanyNews[]>();
  private redditDataFetched = new Subject<redditObj[]>();
  private twitterDataFetched = new Subject<redditObj[]>();
  private trendsDataFetched = new Subject<RecTrends[]>();

  constructor(private http: HttpClient) {}

  getStockDetails(ticker: String) {
    const BACKEND_URL = environment.apiUrl + "/summary/"+ticker;
    this.http
      .get<{ message: String, info: StockDetails }>(
        BACKEND_URL
      )
      .subscribe(Stockdata => {
        this.info = Stockdata.info;
        this.stocksFetched.next(this.info);
      });

  }

  getPeers(ticker: String) {
    const BACKEND_URL = environment.apiUrl + "/peers/"+ticker;
    return this.http.get<{ message: String, peers: string[] }>(BACKEND_URL);
  }

  getStockPrice(ticker: String) {
    const BACKEND_URL = environment.apiUrl + "/details/"+ticker;
    this.http
      .get<{ message: String, priceinfo: StockPrice }>(
        BACKEND_URL
      )
      .subscribe(Stockpriceinfo => {
        this.priceinfo = Stockpriceinfo.priceinfo;
        this.pricesFetched.next(this.priceinfo);
      });

  }

  getStocksfetchedListener() {
    return this.stocksFetched.asObservable();
  }

  getPricesfetchedListener() {
    return this.pricesFetched.asObservable();
  }


  getCompanyNews(ticker: String) {

    const BACKEND_URL = environment.apiUrl + "/companynews/"+ticker;
    console.log(BACKEND_URL);
    this.http
      .get<{ message:string, companynews: CompanyNews[] }>(
        BACKEND_URL
      )
      .subscribe(companyNewsData => {
        this.companynews = companyNewsData.companynews;
        this.newsUpdated.next([...this.companynews]);
      });

  }

  getTrends(ticker: String) {

    const BACKEND_URL = environment.apiUrl + "/recommendations/"+ticker;
    console.log(BACKEND_URL);
    this.http
      .get<{ message:string, trends: RecTrends[] }>(
        BACKEND_URL
      )
      .subscribe(rectrendsData => {
        this.trends = rectrendsData.trends;
        this.trendsDataFetched.next([...this.trends]);
      });

  }

  getTrendsUpdateListener() {
    return this.trendsDataFetched.asObservable();
  }


  getNewsUpdateListener() {
    return this.newsUpdated.asObservable();
  }

  getHistoricalChartData(ticker: String) {
    const BACKEND_URL = environment.apiUrl + "/candles/"+ticker;
    this.http
      .get<{ message: String, candledata: HistoricalData }>(
        BACKEND_URL
      )
      .subscribe(candleDataInfo => {
        this.candleData = candleDataInfo.candledata;
        this.candleDataFetched.next(this.candleData);
      });
  }

  getCandleDataListener() {
    return this.candleDataFetched.asObservable();
  }

  getHourlyChartData(ticker: String) {

    console.log("inside getHourly data");

    const BACKEND_URL = environment.apiUrl + "/hourly/"+ticker;
    this.http
      .get<{ message: String, candledata: HistoricalData }>(
        BACKEND_URL
      )
      .subscribe(hourlyDataInfo => {
        this.hourlyData = hourlyDataInfo.candledata;
        this.hourlyDataFetched.next(this.hourlyData);
      });
  }



  getHourlyDataListener() {
    return this.hourlyDataFetched.asObservable();
  }

  getMentionData(ticker: String) {

    console.log("inside get mention data");

    const BACKEND_URL = environment.apiUrl + "/mentions/"+ticker;
    this.http
      .get<{ reddit: redditObj[], symbol: string, twitter: redditObj[] }>(
        BACKEND_URL
      )
      .subscribe(mentionDataInfo => {
        this.allRedditData = mentionDataInfo.reddit;
        this.allTwitterData = mentionDataInfo.twitter;
        this.redditDataFetched.next(this.allRedditData);
        this.twitterDataFetched.next(this.allTwitterData);
        console.log("this.allreddit");
        console.log(this.allRedditData);
        console.log(this.allTwitterData);
      });
  }

  getRedditDataListener() {
    return this.redditDataFetched.asObservable();
  }

  getTwitterDataListener() {
    return this.twitterDataFetched.asObservable();
  }

}


