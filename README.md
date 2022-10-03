# WebTech-Angular-Project

Technologies used to develop this application : AJAX, JSON, HTML5, ng-bootstrap, Angular.JS, Node.JS, GCP, Finnhub APIs 

Application is deployed in GCP. URL : https://stocksdata-finnhub-3676268.uw.r.appspot.com/

Created a single page web application that allows users to search for stocks using the Finnhubb API and display the results on the details page. 
A user will first open a page where he can enter the stock ticker symbol and select from a list of matching stock symbols using “autocomplete.” A quote on a matched stock symbol can be performed. 
There are 4 routes for this application:
a) Homepage/ Search Route [‘/’] – It is a default route of this application.
b) Watchlist Route [‘/watchlist’] – It displays the watchlist of the user.
c) Portfolio Route [‘/portfolio’] – It displays the portfolio of the user.
d) Details Route [‘/details/<ticker>’] – It shows the details of the <ticker>.
