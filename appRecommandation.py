from flask import Flask, jsonify
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


from sqlalchemy.engine import URL

DB_URL = URL.create(
    drivername="mysql+pymysql",
    username="",
    password="",
    host="127.0.0.1", 
    port=3306,
    database="mg"
)
engine = create_engine(DB_URL)
# TEST CONNECTION - remove this after it works
try:
    with engine.connect() as conn:
        print("DB Connected successfully!")
except Exception as e:
    print("DB Connection failed:", e)

def get_recommendations(user_id: int, top_n: int = 6):
    # Load reviews/ratings from DB
    ratings_df = pd.read_sql("""
        SELECT user_id, product_id, rating 
        FROM reviews
    """, engine)

    # Load products
    products_df = pd.read_sql("""
        SELECT 
            p.id, 
            p.name, 
            p.description, 
            p.categorie_id, 
            c.name AS category_name,
            p.price, 
            p.image_url
        FROM product p
        JOIN category c ON p.categorie_id = c.id
    """, engine)

    # Avoid downstream errors when source tables are empty.
    if ratings_df.empty or products_df.empty:
        return []

    # Build user-product matrix
    matrix = ratings_df.pivot_table(
        index='user_id', 
        columns='product_id', 
        values='rating'
    ).fillna(0)

    # If user has no ratings yet → return top rated products
    if user_id not in matrix.index:
        top = ratings_df.groupby('product_id')['rating'].mean().nlargest(top_n).index.tolist()
        return products_df[products_df['id'].isin(top)].to_dict(orient='records')

    # Compute similarity only against the target user (faster than full user-user matrix).
    target_vector = matrix.loc[user_id].values.reshape(1, -1)
    other_users_matrix = matrix.drop(index=user_id)

    if other_users_matrix.empty:
        similar_users = []
    else:
        similarity_scores = cosine_similarity(other_users_matrix.values, target_vector).flatten()
        similar_users = (
            pd.Series(similarity_scores, index=other_users_matrix.index)
            .sort_values(ascending=False)
            .head(10)
        )
        similar_users = similar_users[similar_users > 0].index.tolist()

    # Products already rated by this user
    rated_by_user = set(ratings_df[ratings_df['user_id'] == user_id]['product_id'])

    # Products rated highly by similar users but not yet seen
    candidates = ratings_df[
        (ratings_df['user_id'].isin(similar_users)) &
        (~ratings_df['product_id'].isin(rated_by_user))
    ]

    # Score by average rating among similar users
    scored = candidates.groupby('product_id')['rating'].mean().nlargest(top_n).index.tolist()

    # If there are no useful similar-user candidates, start from global top-rated unseen.
    if not scored:
        scored = ratings_df[
            ~ratings_df['product_id'].isin(rated_by_user)
        ].groupby('product_id')['rating'].mean().nlargest(top_n).index.tolist()

    # Fallback if not enough results
    if len(scored) < top_n:
        excluded_ids = set(scored).union(rated_by_user)
        extra = ratings_df[
            ~ratings_df['product_id'].isin(excluded_ids)
        ].groupby('product_id')['rating'].mean().nlargest(top_n - len(scored)).index.tolist()
        scored += extra

    return products_df[products_df['id'].isin(scored)].to_dict(orient='records')


@app.route('/recommend/<int:user_id>', methods=['GET'])
def recommend(user_id):
    try:
        results = get_recommendations(user_id)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5011, debug=False, use_reloader=False, threaded=True)
