import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"

const Page = () => {
  const { itemCount } = useCart()

  return (
    <div>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/carrinho" className="relative">
                <Button className="cannabis-button smoke-effect">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Carrinho
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </li>
            {/* rest of code here */}
          </ul>
        </nav>
      </header>
      <main>{/* rest of code here */}</main>
    </div>
  )
}

export default Page
