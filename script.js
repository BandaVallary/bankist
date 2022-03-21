'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
// to display the transactions and their type.
const displayMovements = function (movements, sort = false) {
  // to empty the entire container and then add new ones. here innerHTML is a setter
  containerMovements.innerHTML = '';
  // when we need to sort the movements, we add a second parameter sort and set it to false. create a new variable that is defined conditionally. We do not use sort() because it will order the actual underlying array and therefore we need a shallow copy of the array
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (transaction, i) {
    const type = transaction > 0 ? 'deposit' : 'withdrawal';
    const html = `
   
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">
      ${i + 1}${type}</div>
    
      
      <div class="movements__value">${transaction} EUR</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const displayBalance = function (acc) {
  // lets first calculate the balance //// To display the balance of an account. We can use the reduce method.
  // const balance = movements.reduce((sum, current) => sum + current,0);
  acc.balance = acc.movements.reduce((sum, current) => sum + current, 0);
  labelBalance.textContent = `${acc.balance} EUR`;
};

const displaySummary = function (acc) {
  // const incomes = movements
  //   .filter(function (mov) {
  //     return mov > 0;
  //   })
  //   .reduce(function (sum, current) {
  //     return sum + current;
  //   }, 0);
  // We can also use arrow functions
  acc.incomes = acc.movements // here we pass in the entire account in-order to have access to its properties e.g interest rate
    .filter(mov => mov > 0)
    .reduce((sum, current) => sum + current, 0);
  //displaying it to the relevant HTML element
  labelSumIn.textContent = `${acc.incomes}EUR`;
  acc.withdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((sum, current) => sum + current);
  labelSumOut.textContent = `${Math.abs(acc.withdrawals)}`;
  acc.interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100) // if we want sum of interests above one, then we add a filter method
    .filter(function (curr, i, arr) {
      return curr >= 1;
    })
    .reduce((add, current) => add + current);
  labelSumInterest.textContent = `${acc.interest}EUR`;
};

const createUsername = function (accs) {
  // now we want to create usernames and not create a new array for them
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (user) {
        return user[0];
      })
      .join('');
    // now we want to be able to take the first letters of each name. The split method returns an array. We want to return the username , hence use the map method.
  });
};
createUsername(accounts);

const updateUI = function (account) {
  //display movements
  displayMovements(account.movements);
  //display balance
  displayBalance(account);

  // display summary. Here we call the entire account as well
  displaySummary(account);
};
let currentAccount;
//Event handlers
btnLogin.addEventListener('click', function (e) {
  // preventing form from submitting
  e.preventDefault();
  // finding user from whom the details are inputted in the form
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  ); // we will need current account username for all accounts hence we should declare/define it globally.
  console.log('Log in');
  // if condition is not matched, undefined id returned. Thus we first need to check if an account exists first using optional chaining.
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display welcome message ui
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // clear the input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); //removing focus on PIN field
    // to display the balance, summary and movements
    updateUI(currentAccount);
  }
});
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  // you have to check the person you are transferring to

  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  // clean input values whether the transation was successful or not
  inputTransferAmount.value = inputTransferTo.value = '';
  // you can only transfer money iff the current acoount balance is !=0 and above the amount you want to transfer. You can also not transfer money to yourself. Receiver should also exist
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // the amount should be added to the receiver account and deducted from sender's account.
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    console.log(amount, receiverAcc, currentAccount);
    updateUI(currentAccount);
  }
  // console.log(amount, receiverAcc);
});
// requesting a loan. For our application we are going to allow loans iff the loan amout requested is 10% of any deposits made to the account.
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  // clear the input fields
  inputLoanAmount.value = '';
});
// to close an account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  // we can only close an account if the current user, pin and closer user and pin match.
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //to delete an account from the accounts array, the splice method is used. this method requires an index to operate hence the findIndex method.
    accounts.splice(index, 1);
    // hide the UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
// state variable that monitors whether we are currently sorting the array or not. hence should live outside to preserve the state
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted); // we want the opposite of sorted
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const balance = movements.reduce(function (sum, current) {
  return sum + current;
}, 0);
// console.log(balance);
//  creating usernames. This is the first letters from each user's names

/////////////////////////////////////////////////
age => (age >= 2 ? 16 + age * 2 : age * 2);
