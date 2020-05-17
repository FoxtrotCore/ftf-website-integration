import { Component, OnInit, Input, ViewChild } from '@angular/core';
import * as Hls from 'hls.js';

@Component({
  selector: 'video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})

export class VideoPlayerComponent implements OnInit {
  @Input() ep: Number;
  src: string;
  poster: string;
  hls: Hls;
  video: any;

  default_video_codec = 'audio/mp4; codecs="avc1.640034"';
  default_audio_codec = 'video/mp4; codecs="mp4a.40.2"';

  constructor() {}
  @ViewChild('parent', { static: false }) parent: { nativeElement: { querySelector: (arg0: string) => any; }; };
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.hls = new Hls();
    this.video = this.parent.nativeElement.querySelector('#player');
    if(this.ep != null){ this.loadStream(); }
  }

  loadStream(): void {
    this.hls.attachMedia(this.video);

    if(Hls.isSupported()) {
      this.src = "https://media.foxtrotfanatics.com/" + this.ep + "/master.m3u8";
      this.poster = "https://media.foxtrotfanatics.com/" + this.ep + "/thumbnail.png"
      this.video.setAttribute('poster', this.poster);

      this.hls.loadSource(this.src);
    }
  }
}
