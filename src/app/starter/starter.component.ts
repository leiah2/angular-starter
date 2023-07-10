import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { StarterAPI } from "./starter";


@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.css']
})
export class StarterComponent implements AfterViewInit {
  @ViewChild("arena") public arena?: ElementRef<HTMLElement>;
  @ViewChild("rect") public rect?: ElementRef<HTMLElement>;

  constructor() { }

  ngAfterViewInit(): void {

    const setup =  {
      arena : this.arena.nativeElement,
      rect : this.rect.nativeElement

    }
    const interactive = new StarterAPI(setup)
  }

}
