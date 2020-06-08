import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'video-page',
  templateUrl: './video-page.component.html',
  styleUrls: ['./video-page.component.scss']
})
export class VideoPageComponent implements OnInit {
  episode: Number;
  constructor(private router: Router, private active: ActivatedRoute) {}

  ngOnInit(): void {
    this.episode = Number(this.active.snapshot.paramMap.get('ep'));

    if(this.episode.toString() === 'NaN' || this.episode < 0 || this.episode > 95){
      console.debug('Not valid episode number!');
      this.router.navigate(['']);
    }
  }
}
