import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';
import { Chart } from 'chart.js';

import { BillingChart, BillingChartService, ConsumerExpected, DateMoment, ErrorResponse } from '@app/core';
import { AlertService } from '../shared';

@Component({
  selector: 'admin-billing-chart',
  templateUrl: 'billing-chart.component.html',
})

export class BillingChartComponent implements OnInit {

  model: BillingChart;
  tableExpectedConsumer: Array<{
    name: string,
    month: DateMoment,
    monthNumber: number,
    effectiveAmount: number,
    expectedAmount: number
  }> = [];
  tableMonth: Array<{
    month: DateMoment,
    monthNumber: number,
    countColumn: number
  }> = [];

  isLoading = false;

  chartBar: Chart;
  chartPie: Chart;

  colors = [
    '#4dc9f6',
    '#f67019',
    '#f53794',
    '#537bc4',
    '#acc236',
    '#166a8f',
    '#00a950',
    '#58595b',
    '#8549ba'
  ];

  constructor(
    protected dataService: BillingChartService,
    protected alertService: AlertService
  ) {
    this.model = new BillingChart();
  }

  ngOnInit() {
    this.isLoading = true;
    this.dataService
      .fetch()
      .subscribe(this.onFetchModelSuccess, this.onError);
  }

  protected onFetchModelSuccess = (model: BillingChart) => {
    this.model = model;

    this.renderExpectedConsumerChart(this.model.expectedConsumerList);

    this.renderBillIssuedChart(this.model.billIssuedList);

    this.isLoading = false;
  }

  protected renderExpectedConsumerChart(consumers: ConsumerExpected[]) {
    consumers.forEach(expectedConsumer => {
      expectedConsumer.expectList.forEach(data => {
        this.tableExpectedConsumer.push({
          name: data.billingCycle,
          month: data.month,
          monthNumber: data.monthNumber,
          effectiveAmount: 0,
          expectedAmount: data.billingCycleCount
        });

        const monthColumn = _.find(this.tableMonth, { 'monthNumber': data.monthNumber });
        if (_.isEmpty(monthColumn)) {
          this.tableMonth.push({
            monthNumber: data.monthNumber, month: data.month, countColumn: 1
          });
        } else {
          monthColumn.countColumn = monthColumn.countColumn + 1;
        }
      });

      expectedConsumer.effectiveList.forEach(data => {
        const item = _.find(this.tableExpectedConsumer, { 'name': data.billingCycle, 'monthNumber': data.monthNumber });
        if (!_.isEmpty(item)) {
          item.effectiveAmount = data.billingCycleCount;
        }
      });
    });

    this.tableExpectedConsumer = _.sortBy(this.tableExpectedConsumer, ['monthNumber', 'name']);
    this.tableMonth = _.sortBy(this.tableMonth, 'monthNumber');

    const datasets: Chart.ChartDataSets[] = [];

    datasets.push({
      type: 'bar',
      label: `Effective`,
      // stack: `stack`,
      backgroundColor: this.colors[0],
      data: this.tableExpectedConsumer.map(res => res.effectiveAmount)
    });

    datasets.push({
      type: 'bar',
      label: `Expected`,
      // stack: `stack`,
      backgroundColor: this.colors[1],
      data: this.tableExpectedConsumer.map(res => res.expectedAmount)
    });

    this.chartBar = new Chart('chartBar', {
      type: 'bar',
      data: {
        labels: this.tableExpectedConsumer.map(res => [
          res.name, res.month.moment.format('MMMM')
        ]),
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: 'top',
        },
        tooltips: {
          mode: 'index',
          position: 'average',
          intersect: false,
        },
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            // stacked: true,
            display: true,
          }],
        }
      }
    });
  }

  protected renderBillIssuedChart(data: Array<{ name: string, value: number }>) {
    this.chartPie = new Chart('chartPie', {
      type: 'pie',
      data: {
        labels: data.map(res => `${res.name} bill`),
        datasets: [{
          data: data.map(res => res.value),
          backgroundColor: this.colors,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: 'bottom',
        }
      }
    });
  }

  protected onError = (error: ErrorResponse) => {
    this.alertService.clear();
    this.alertService.error(error.message, true);
    this.isLoading = false;
  }
}
