# Installation 

Once inside WebApp directory run npm install to install the dependencies.


# Linking the Web interface with your smart contracts

To link the Web Interface with your smart contracts you need to :

1)- Replace the addresses inside `./src/utils/Web3Helper` file with your addresses.\
2)- Replace the addresses inside `./src/constants/index` file with your deployed token contracts.



# Adding new tokens to the token list

To add new tokens to the token list you just need to create an object of that token with deployed version inside `./src/constants/index` file.

If you wish to have them exported from Web3Helper you can create an instance inside Web3Helper as well.

To display the balances of the certain token add it inside `./src/components/balance/index` file following the examples.


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.