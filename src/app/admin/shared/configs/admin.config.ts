const format = {
  date: 'DD/MM/YYYY',
  dayMonth: 'DD MMM',
  dateTime: 'DD/MM/YYYY HH:mm:ss',
  apiDate: 'YYYY-MM-DD[T]00:00:00[Z]',
  apiDateTime: 'YYYY-MM-DD[T]HH:mm:ss[Z]',
  apiDateMonthYear: 'DD MMM YY',
};

export const AdminConfig: { [name: string]: any } = {
  format,
  bootstrap: {
    datePicker: {
      dateInputFormat: format.date,
      containerClass: 'theme-dark-blue'
    }
  },
  validation: {
    passwordPattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d.*)(?=.*\\W.*)[a-zA-Z0-9\\d\\W\\S].{8,16}$',
    ebsNo: '^([1-9]{1}[0-9]{9})$',
    previewFile: '(\\.(gif|jpg|jpeg|png|tiff|pdf)$)',
    singaporeIdentificationNo: '^\\w{9}$',
    mobileNumber: '^\\d{8}$',
    decimalPattern: '^(0*[1-9][0-9]*(\\.[0-9]+)?|[-]{0,1}[0-9]+\\.[0-9]*[1-9][0-9]*|[-]{0,1}[0-9]*[1-9][0-9]*)$',
    positiveDecimalPattern: '^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$',
    Pattern4DecimalPlaces: '^(0*[0-9][0-9]*(\\.\\d{0,4})*)$',
    alphaNumeric: '^\\w*$',
    integer: '^\\d*$',
    zeroToOne: '^(0(\\.\\d+)?|1(\\.0+)?)$'
  },
  queryParams: {
    backHistory: 'bk'
  },
  numberPipe: '1.2-4',
  number4Pipe: '1.4-4',
};
