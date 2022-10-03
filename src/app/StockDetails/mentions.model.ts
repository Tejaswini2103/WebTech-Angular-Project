import {redditObj} from './reddit.model';

export interface mentions {
  reddit: redditObj[];
  sym: string;
  twitter: redditObj[];
}
