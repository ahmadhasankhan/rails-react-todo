# TODO APP using Rails+React

## Step 1: Create a New Rails Application

In a new terminal window, run the following commands.

```
rails new todo-application -d=postgresql --webpacker=react
cd todo-application
rails db:create
rails s
```

Notes:
* We append `--webpacker=react` to the rails new command in order to install React and its dependencies. This command also generates a sample React component at `app/javascript/packs/hello_react.jsx`, and creates a file to manage Webpack at `config/webpacker.yml`.

* We append `-d=postgresql` to the rails new command in order to use `PostgreSQL` as the default database. This is personal preference, but something I recommend since it makes deploying to Heroku easier.


If you open up a browser and navigate to http://localhost:3000/ you should see the rails welcome page:


### Create Homepage

In a new terminal window run the following command.
```
rails g controller pages home my_todo_items
```

This command generates and modifies a lot of files, but all we will care about are 
`app/views/pages/` and `app/controllers/pages_controller.rb`.

Open up `config/routes.rb` and replace get `'pages/home'` with root `'pages#home'`

```
# config/routes.rb
Rails.application.routes.draw do
  root 'pages#home'
  get 'pages/my_todo_items'
end
```

If you open up a browser and navigate to http://localhost:3000/ you should see the new home page:


### Load Bootstrap

In the interest of time, we're going to use Bootstrap to style our application. Luckily Bootstrap can be installed as a dependency, which means we can use it for our React application, as well as regular Rails `.erb` files.

In a new terminal window run the following command.

```
yarn add bootstrap jquery popper.js
```

Open `app/javascript/packs/application.js` add the following.

```
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require('@rails/ujs').start()
require('turbolinks').start()
require('@rails/activestorage').start()
require('channels')

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)
require('bootstrap')
import 'bootstrap/dist/css/bootstrap'
```

Open `app/views/layouts/application.html.erb` and add `<%= stylesheet_pack_tag 'application' %>`.

```
<!DOCTYPE html>
<html>
  <head>
    <title>TodoApplication</title>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>

    <%= stylesheet_link_tag 'application', media: 'all', 'data-turbolinks-track': 'reload' %>
    <%= javascript_pack_tag 'application', 'data-turbolinks-track': 'reload' %>
    <%= stylesheet_pack_tag 'application' %>
  </head>

  <body>
    <%= yield %>
  </body>
</html>
```

If you open up a browser and navigate to http://localhost:3000/ you should notice that Bootstrap is now affecting site styes.

### Load Sample React Application

Finally, we want to ensure that both React and webpacker are working properly. To do so, we will temporarily load the sample React application that shipped with our Rails application. Open up `app/javascript/packs/application.js` and add `require("./hello_react")`;

```
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require('@rails/ujs').start()
require('turbolinks').start()
require('@rails/activestorage').start()
require('channels')

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)
require('./hello_react')
require('bootstrap')
import 'bootstrap/dist/css/bootstrap'
```

If you open up a browser and navigate to http://localhost:3000/ you should notice that the sample React application has loaded, and is displaying Hello React!.

## Step 2: Install and Configure Devise

In order for someone to use our application, they'll need to create an account. Instead of building an authentication system from scratch, we'll use devise. Devise is a battle tested, well documented authentication solution for Rails.

* Open up your Gemfile and add gem `'devise', '~> 4.7', '>= 4.7.1'.`
* In a terminal window run `bundle install`.
* Then run `rails generate devise:install`.
* Open `config/environments/development.rb` and add `config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }`.

```
Rails.application.configure do
  # config/environments/development.rb
  ...
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
end
```

### Generate a User Model
Now we need to generate a `User` model. This model will eventually be associated with the `TodoItem` model.

1. In a terminal window run `rails generate devise User`.
2. Then run `rails db:migrate`
3. Open up `db/seeds.rb` and add the following.

```
# db/seeds.rb
...
2.times do |i|
    User.create(email: "user-#{i+1}@example.com", password: "password", password_confirmation: "password")
end
```

4. Finally in a terminal window run `rails db:seed`

### Build a Header
Now we need a way for users to login and out of our application. Don't get too bogged down on these steps, since they have less to do with React, and more to do with styling.
1. In a terminal window run mkdir `app/views/shared`.
2. Then run touch `app/views/shared/_flash.html.erb`.
3. Then run touch `app/views/shared/_navigation.html.erb`.
4. Open up `app/views/shared/_flash.html.erb` and add the following.

    ```
    # app/views/shared/_flash.html.erb
    <% flash.each do |key, value| %>
        <div class="container">
            <div class="alert <%= key == 'notice' ? 'alert-primary' : 'alert-danger' %>" role="alert">
                <%= value %>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    <% end %>
    ```

5. Open up `app/views/shared/_navigation.html.erb` and add the following.

    ```
    <!-- app/views/shared/_navigation.html.erb -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-5">
      <div class="container">
        <%= link_to "Rails React Example", root_path, class: "navbar-brand" %>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <% if user_signed_in? %>
                <%= link_to('Logout', destroy_user_session_path, method: :delete, class: "nav-link") %>
              <% else %>
                <%= link_to('Login', new_user_session_path, class: "nav-link") %>
              <% end %>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    ```

    The only part that really matters here is the following:
    
    ```
    <% if user_signed_in? %>
      <%= link_to('Logout', destroy_user_session_path, method: :delete, class: "nav-link") %>
    <% else %>
      <%= link_to('Login', new_user_session_path, class: "nav-link") %>
    <% end %>
    ```

6. Load these partials into `app/views/layouts/application.html.erb`.

    ```
    <!-- app/views/layouts/application.html.erb -->
    <!DOCTYPE html>
    <html>
      <head>
        <title>TodoApplication</title>
        <%= csrf_meta_tags %>
        <%= csp_meta_tag %>
    
        <%= stylesheet_link_tag 'application', media: 'all', 'data-turbolinks-track': 'reload' %>
        <%= javascript_pack_tag 'application', 'data-turbolinks-track': 'reload' %>
        <%= stylesheet_pack_tag 'application' %>
      </head>
    
      <body>
        <%= render "shared/navigation" %>
        <%= render "shared/flash" %>
        <%= yield %>
      </body>
    </html>
    ```
7. As a final step, let's add a container to the page, as well as responsive meta tag.
    ```
    <!-- app/views/layouts/application.html.erb -->
    <!DOCTYPE html>
    <html>
      <head>
        <title>TodoApplication</title>
        <%= csrf_meta_tags %>
        <%= csp_meta_tag %>
    
        <%= stylesheet_link_tag 'application', media: 'all', 'data-turbolinks-track': 'reload' %>
        <%= javascript_pack_tag 'application', 'data-turbolinks-track': 'reload' %>
        <%= stylesheet_pack_tag 'application' %>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      </head>
    
      <body>
        <%= render "shared/navigation" %>
        <%= render "shared/flash" %>
        <div class="container">
          <%= yield %>
        </div>
      </body>
    </html>
    ```
If you open up a browser and navigate to http://localhost:3000/ you should see the top header.

### Create Homepage for Authorized Users

Now that we have a way to login and out of our application, let's add a homepage that only authentication users will see. This page will eventually display our React application.

1. Open up config/routes.rb and add the following:
    ```
    # config/routes.rb
    Rails.application.routes.draw do
      devise_for :users
      authenticated :user do
        root "pages#my_todo_items", as: :authenticated_root
      end
      root 'pages#home'
    end
    ```
### Style Login Page (Optional)

1. In a terminal window run `rails generate devise:views`.
2. Open up `app/views/devise/sessions/new.html.erb` and add the following.
   * Note that I am simply adjusting the markup, and not affecting functionality. This is strictly a cosmetic edit.

```
<!-- app/views/devise/sessions/new.html.erb -->
<h2>Log in</h2>
<div class="row">
  <div class="col-md-6 col-lg-8">
    <h4>User the following accounts to test the application</h4>
    <table class="table table-sm">
      <thead>
        <tr>
          <th scope="col">Email</th>
          <th scope="col">Password</th>
        </tr>
      </thead>
      <tbody>
        <% User.all.each do |user| %>
          <tr>
            <td><%= user.email %></td>
            <td>password</td>
          </tr>
        <% end %>
      </tbody>
    </table>
  </div>
  <div class="col-md-6 col-lg-4">
    <%= form_for(resource, as: resource_name, url: session_path(resource_name), html: { class: "border shadow-sm rounded p-3 mb-3" } ) do |f| %>
      <div class="form-group">
        <%= f.label :email %>
        <%= f.email_field :email, autofocus: true, autocomplete: "email", class: "form-control" %>
      </div>

      <div class="form-group">
        <%= f.label :password %><br />
        <%= f.password_field :password, autocomplete: "current-password", class: "form-control" %>
      </div>

      <% if devise_mapping.rememberable? %>
        <div class="form-group">
          <%= f.check_box :remember_me %>
          <%= f.label :remember_me %>
        </div>
      <% end %>

      <div class="form-group">
        <%= f.submit "Log in", class: "btn btn-primary" %>
      </div>
    <% end %>

    <%= render "devise/shared/links" %>
  </div>
</div>
```

If you open up a browser and navigate to http://localhost:3000/users/sign_in you should see the new design:

## Step 3: Create Todo Item Model

Now we need to create a model to that will represent our todo items, and have them associated with our User model.

1. In a terminal window run `rails g model TodoItem title user:references complete:boolean`.
2. What we're doing here is creating a new model named `TodoItem`. It will have a title field, a complete field that is simply a boolean, and finally it will be associated with our User model.

Open up the newly created migration file `db/migrate/YYYYMMDDHHMMSS_create_todo_items.rb` and add the following.
    
    # db/migrate/YYYYMMDDHHMMSS_create_todo_items.rb
    class CreateTodoItems < ActiveRecord::Migration[6.0]
      def change
        create_table :todo_items do |t|
          t.string :title
          t.references :user, null: false, foreign_key: true
          t.boolean :complete, default: false
    
          t.timestamps
        end
      end
    end

By adding `default: false`, we're telling the database that the default value for complete on a `TodoItem` will be false.

3. In a terminal window run `rails db:migrate`

### Write Validations

Now that we have a TodoItem model, we should write some validations to ensure any data saved into the database is valid. For example, we don't want a TodoItem to be saved if there's no title, or if it's not associated with a User.

1. Open up `app/models/todo_item.rb` and add the following.

    ```
    # app/models/todo_item.rb
    class TodoItem < ApplicationRecord
      belongs_to :user
    
      validates :title, presence: true
    end
    ```

### Set a Default Scope

Next we'll want to ensure that the newest `TodoItems` appear first when queried. To do this, we can use a default scope.

1. Open up app/models/todo_item.rb and add the following.
    ```
    # app/models/todo_item.rb
    class TodoItem < ApplicationRecord
      default_scope { order(created_at: :desc) }
    
      belongs_to :user
    
      validates :title, presence: true
    end
    ```

### Create Association Between User and TodoItem

Next we need to create an association between the `User` and the `TodoItem`. This has already been started for us in `app/models/todo_item.rb` with the `belongs_to :user` line.

1. Open up app/models/user.rb and add the following.
    ```
   # app/models/user.rb
   class User < ApplicationRecord
     ...
     has_many :todo_items, dependent: :destroy
   end
   ```
This ensures that a `User` is associated with many `TodoItems`. It also means that if a `User` is deleted, so will their associated `ToDoItems`.

### Add Seed Data

1. Open up `db/seeds.rb` and add the following.

   ```
   # db/seeds.rb
   ...
   2.times do |i|
       User.create(email: "user-#{i+1}@example.com", password: "password", password_confirmation: "password")
   end
   
   User.all.each do |u|
       10.times do |i|
           u.todo_items.create(title: "To Do Item #{i+1} for #{u.email}", complete: i % 3  == 0 ? true : false  )
       end
   end
   ```
    This simply creates 10 `TodoItems` for each `User`, and marks every third item complete.

2. In a terminal window run `rails db:seed`.
3. To ensure everything worked, open up a terminal widow and run `rails c`. Once the environment loads, run `TodoItem.count`. The output should be similar to the following:

## Step 4: Create the API

Now that we have our data models, we need to create an API for our React application to digest.
### Generate a Controller

1. In a new terminal window run rails g controller `api/v1/todo_items`.
We pass the command `api/v1/todo_items` and not todo_items because we want to namespace our API. 
This is not required, but is encouraged. In the future, other applications could digest our API. If at anytime we were to change our API, we would risk breaking these applications. It's best to version our API so that other applications can opt-in to new features.

### Create Non Authorized End Points

#### Create Empty Controller Actions
First we need to create an action for each endpoint in our API.
1. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following.

    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        before_action :set_todo_item, only: [:show, :edit, :update, :destroy]
        def index
        end
        def show
        end
        def create
        end
        def update
        end
        def destroy
        end
        private
            def set_todo_item
                @todo_item = TodoItem.find(params[:id])
            end
    end
    ```
   
The private `set_todo_item` method will find the `TodoItem` based on the `ID` in the URL.

#### Update Routes
Now we need to create corresponding routes for our controller actions.
1. Open up `config/routes.rb` and add the following.

    ```
    # config/routes.rb
    Rails.application.routes.draw do
      devise_for :users
      authenticated :user do
        root "pages#my_todo_items", as: :authenticated_root
      end
      root 'pages#home'
      namespace :api, defaults: { format: :json } do
        namespace :v1 do
          resources :todo_items, only: [:index, :show, :create, :update, :destroy]
        end
      end
    end
    ```
We use a namespace in order to make our routes render at `/api/v1/todo_items`. 
This way, we can easily add new versions of our API in the future. We use `defaults: { format: :json }` to ensure that the data returned from these routes is JSON.

#### Create jbuilder Files

Normally in Rails there is a corresponding .erb view file for each controller action. However, since we're building an API we need to create corresponding jbuilder files for each controller actions.

1. In a new terminal window run the following commands.
    ```
    mkdir -p app/views/api/v1/todo_items
    touch app/views/api/v1/todo_items/_todo_item.json.jbuilder
    touch app/views/api/v1/todo_items/show.json.jbuilder
    touch app/views/api/v1/todo_items/index.json.jbuilder
    ```
2. Open `app/views/api/v1/todo_items/_todo_item.json.jbuilder` and add the following. This will serve as a reusable partial for other `.jbuilder` files.
    ```
    # app/views/api/v1/todo_items/_todo_item.json.jbuilder
    json.extract! todo_item, :id, :title, :user_id, :complete, :created_at, :updated_at
    ```
    `json.extract!` is a method that takes an object (in this case a TodoItem), and a list of attributes we want to render into JSON.
    
3. Open `app/views/api/v1/todo_items/show.json.jbuilder` and add the following.
    ```
    # app/views/api/v1/todo_items/show.json.jbuilder
    json.partial! "api/v1/todo_items/todo_item", todo_item: @todo_item
    ```
    json.partial! will render the _todo_item.json.jbuilder partial, and takes @todo_item as an argument. The @todo_item is handled through our private set_todo_item method in our controller.
    
4. Open `app/views/api/v1/todo_items/index.json.jbuilder` and add the following.
    ```
    # app/views/api/v1/todo_items/index.json.jbuilder
    json.array! @todo_items, partial: "api/v1/todo_items/todo_item", as: :todo_item
    ```
    `json.array!` will take a list of queried `TodoItems` and pass each `TodoItem` into the `_todo_item.json.jbuilder` partial. We still need to add `@todo_items` into our controller index action.

#### Update Controller Actions
Now we need to update our controller actions so that we can pass data into our newly created `.jbuilder` files. For now, we're just going to updated the index action.

1. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following.
    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        def index
            @todo_items = TodoItem.all
        end
    end
    ```
   
* If you open up a browser and navigate to http://localhost:3000/api/v1/todo_items you should see the API response.

* If you open up a browser and navigate to http://localhost:3000/api/v1/todo_items/1 you should see an specific API response.

### Authorize End Points

Now that we have a base for our API, you might have noticed a few problems.

1. A visitor does not need to be authenticated to visit these endpoints.
2. There is no association between a visitor and the TodoItems displayed.

This is a problem because it means a visitor to our site could go to http://localhost:3000/api/v1/todo_items and see all of the site's data.

#### Lock Down The Controller
First we need to lock down our controller by authenticating all requests. Luckily devise has a helper method that allows us to do just this.

1. Open up `app/controllers/api/v1/todo_items_controller.rb` and add `before_action :authenticate_user!`.

    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        before_action :authenticate_user!
        before_action :set_todo_item, only: [:show, :edit, :update, :destroy]
        ...
    end
    ```
    Now that we're locking down our controller to only authenticated users, we need to associate the User with the `TodoItem`.

2. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following private method.
    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        ...
        private
    
            def set_todo_item
                @todo_item = TodoItem.find(params[:id])
            end
    
            def authorized?
                @todo_item.user == current_user
            end
    end
    ```
    Devise has a helper method called current_user that returns the current signed-in user. So, our private authorized? method will return true is the current TodoItem belongs to the current_user, and false otherwise.
    
    Now we need to handle any requests that are not authorized. Meaning, we need to handle any request where the User is trying to hit an endpoint that does not belong to them.
    
3. In a new terminal window, run the following commands.
    ```
    touch app/views/api/v1/todo_items/unauthorized.json.jbuilder
    ```
    This will create a new `.jbuilder` view to handle unauthorized requests.

4. Open `app/views/api/v1/todo_items/unauthorized.json.jbuilder` and add the following.
    ```
    json.error "You are not authorized to perform this action."
    ```  
    This will return a JSON object with an error key with a value of `"You are not authorized to perform this action."`. Now we need to create a method will conditionally render this view depending on whether or not the current request is authorized.
    
5. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following private method.
    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        ...
        private
    
            def set_todo_item
                @todo_item = TodoItem.find(params[:id])
            end
    
            def authorized?
                @todo_item.user == current_user
            end
    
            def handle_unauthorized
                unless authorized?
                  respond_to do |format|
                    format.json { render :unauthorized, status: 401 }
                  end
                end
            end
    end
    ```
This method checks to see if the request is authorized by calling our authorized? private method. If the request is not authorized, we return our `unauthorized.json.jbuilder` view. Note that we also pass a status of `401`.

#### Update The Index Action

Right now we're just displaying all `TodoItems` through the index action, when we really need to display the current User's TodoItems

1. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following.
    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        ...
        def index
            @todo_items = current_user.todo_items.all
        end
        ...
    end
    ```
   
As a test, make sure to logout of of the application. Once logged out, visit http://localhost:3000/api/v1/todo_items. You should see the following.

#### Update The Show Action
Now let's update the empty show action.

1. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following.
    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
        ...
        def show
            if authorized?
                respond_to do |format|
                  format.json { render :show }
                end
            else
                handle_unauthorized
            end
        end
        ...
    end
    ```

Since we're running `before_action :authenticate_user!` before all our actions, we know that a visitor must be authenticated before they can view a `TodoItem`. However, we need to prevent a visitor from accessing TodoItems that do not belong to them. We check if the current use is authorized with the authorized? private method. If they are, we return `app/views/api/v1/todo_items/show.json.jbuilder`, otherwise we return `app/views/api/v1/todo_items/unauthorized.json.jbuilder`.

As a test, login as user-1@example.com and visit http://localhost:3000/api/v1/todo_items/1. You should see the the TodoItems of this user.

#### Update The Create Action

1. Open up `app/controllers/api/v1/todo_items_controller.rb` and add the following.

    ```
    # app/controllers/api/v1/todo_items_controller.rb
    class Api::V1::TodoItemsController < ApplicationController
      ...
      def create
          @todo_item = current_user.todo_items.build(todo_item_params)
          if authorized?
            respond_to do |format|
              if @todo_item.save
                format.json { render :show, status: :created, location: api_v1_todo_item_path(@todo_item) }
              else
                format.json { render json: @todo_item.errors, status: :unprocessable_entity }
              end
            end
          else
            handle_unauthorized
          end
      end
      ...
      private
        ...
        def todo_item_params
            params.require(:todo_item).permit(:title, :complete)
        end
    end
    ```

First we create a new @todo_item instance variable that builds a new TodoItem from the current_user. We pass in todo_item_params, which we declare as a private method. This concept is called strong parameters, and prevents mass assignment.

If the request is authorized?, we then try to post the record to the database. If the item successfully saves, we pass the new @todo_item into app/views/api/v1/todo_items/show.json.jbuilder and which will return the new @todo_item. Note that we also return a status of created. If the @todo_item does not save, we render the errors, and return a status of unprocessable_entity.

Since we don't have a front-end yet, there's no way for us to create a new TodoItem in the browser. However, we can still test that the create action is working by using the developer console.
