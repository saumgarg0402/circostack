import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as Circos from 'circos'; 

import { gieStainColor } from '../assets/gieStainColor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


  ngOnInit(){
  	d3.queue()
	  .defer(d3.json, '../assets/GRCh37.json')
	  .defer(d3.csv, '../assets/cytobands.csv')
	  .defer(d3.csv, '../assets/segdup.csv')
	  .await(this.drawCircos);
  }
  drawCircos(error, GRCh37, cytobands, segdup){

  	var width=500;

  	var circos = new Circos({
	  container: '#chart',
	  width: width,
	  height: width
	});

  	cytobands = cytobands
				  .filter(function (d) { return d.chrom === 'chr9' })
				  .map(function (d) {
				    return {
				      block_id: d.chrom,
				      start: parseInt(d.chromStart),
				      end: parseInt(d.chromEnd),
				      gieStain: d.gieStain
				    }
				  })

  var start = 39000000
  var length = 8000000
  var data = segdup.filter(function (d) {
    return d.chr === 'chr9' && d.start >= start && d.end <= start + length
  }).filter(function (d) {
    return d.end - d.start > 30000
  }).map(function (d) {
    d.block_id = d.chr
    d.start -= start
    d.end -= start
    return d
  })

  circos
    .layout(
    [{
      id: 'chr9',
      len: length,
      label: 'chr9',
      color: '#FFCC00'
    }],
    {
      innerRadius: width / 2 - 50,
      outerRadius: width / 2 - 30,
      labels: {
        display: false
      },
      ticks: {display: false, labels: false, spacing: 10000}
    }
    )
    .highlight('cytobands', cytobands, {
      innerRadius: width / 2 - 50,
      outerRadius: width / 2 - 30,
      opacity: 0.8,
      color: function (d) {
        return gieStainColor[d.gieStain]
      }
    })
    .stack('stack', data, {
      innerRadius: 0.7,
      outerRadius: 1,
      thickness: 4,
      margin: 0.01 * length,
      direction: 'out',
      strokeWidth: 0,
      color: function (d) {
        if (d.end - d.start > 150000) {
          return 'red'
        } else if (d.end - d.start > 120000) {
          return '#333'
        } else if (d.end - d.start > 90000) {
          return '#666'
        } else if (d.end - d.start > 60000) {
          return '#999'
        } else if (d.end - d.start > 30000) {
          return '#BBB'
        }
      },
      tooltipContent: function (d) {
        return `${d.block_id}:${d.start}-${d.end}`
      }
    })
    .render()

  }
}
