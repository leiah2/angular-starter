import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements AfterViewInit {
  @ViewChild("arena") public arena?: ElementRef<HTMLElement>;


  constructor() { 
  }

  ngAfterViewInit(): void {
  }

}
