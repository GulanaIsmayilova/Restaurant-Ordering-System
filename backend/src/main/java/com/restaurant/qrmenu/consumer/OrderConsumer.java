package com.restaurant.qrmenu.consumer;

import com.restaurant.qrmenu.config.RabbitMQConfig;
import com.restaurant.qrmenu.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrder(OrderResponse order) {
        log.info("CONSUMER triggered: orderId = {}", order.getId());
        messagingTemplate.convertAndSend("/topic/kitchen/orders", order);
    }
}
