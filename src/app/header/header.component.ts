import { Component } from "@angular/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})

export class HeaderComponent {
  enteredTitle = "";
  enteredContent = "";
  path: string ;

  ngOnInit() {

    console.log("THIS IS HEADER!!");
    localStorage.setItem("money","25000");

  }

  openDetails() {

    var ticker = localStorage.getItem("activeTicker");
    this.path="#/details/"+ticker;

  }

}
