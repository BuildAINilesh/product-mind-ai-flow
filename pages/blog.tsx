
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Blog = () => {
  const posts = [
    {
      title: "The Future of AI in Product Development",
      date: "April 20, 2024",
      excerpt: "Exploring how artificial intelligence is transforming the product development landscape",
      category: "AI & Technology"
    },
    {
      title: "Best Practices for Requirements Management",
      date: "April 18, 2024",
      excerpt: "A comprehensive guide to managing product requirements effectively",
      category: "Product Management"
    },
    {
      title: "Automated Testing: A Complete Guide",
      date: "April 15, 2024",
      excerpt: "Learn how to implement automated testing in your product development cycle",
      category: "Testing"
    },
    {
      title: "Market Analysis Using AI",
      date: "April 12, 2024",
      excerpt: "How to leverage AI for better market insights and product decisions",
      category: "Market Research"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Latest Updates & Insights
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay up to date with the latest in product development
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {posts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">{post.date}</div>
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                  {post.category}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
