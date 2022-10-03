import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";

import { Post } from "./posts-model";


import { environment } from "../../environments/environment";
const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts!: Post;
  private postsUpdated = new Subject<Post>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http
      .get<{ message: String, posts: Post }>(
        BACKEND_URL
      )
      .subscribe(postData => {
        this.posts = postData.posts;
        this.postsUpdated.next(this.posts);



      });


  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

}
